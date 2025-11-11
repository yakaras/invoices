import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoicePDF } from '../services/pdfService';
import { sendEmail } from '../services/sesService';
import { Invoice, Template } from '../types';

const router = Router();

// Get all invoices with search and filtering
router.get('/', async (req: Request, res: Response) => {
  const { status, customer_id, search, limit = 20, offset = 0 } = req.query;

  let whereClause = '1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (customer_id) {
    whereClause += ` AND customer_id = $${paramIndex}`;
    params.push(customer_id);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (invoice_number ILIKE $${paramIndex} OR customer_id IN (SELECT id FROM customers WHERE name ILIKE $${paramIndex}))`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  const result = await query(
    `SELECT i.*, c.name as customer_name FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     WHERE ${whereClause}
     ORDER BY i.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     WHERE ${whereClause}`,
    params
  );

  res.json({
    invoices: result.rows,
    total: parseInt(countResult.rows[0].total),
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });
});

// Get single invoice
router.get('/:id', async (req: Request, res: Response) => {
  const result = await query(
    `SELECT i.*, c.name as customer_name FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     WHERE i.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  res.json(result.rows[0]);
});

// Create invoice
router.post('/', async (req: Request, res: Response) => {
  const {
    template_id,
    customer_id,
    invoice_number,
    amount,
    currency = 'USD',
    issue_date,
    due_date,
    data,
  } = req.body;

  if (!template_id || !customer_id || !invoice_number || !amount || !issue_date || !due_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();

  try {
    const result = await query(
      `INSERT INTO invoices (id, template_id, customer_id, invoice_number, amount, currency, issue_date, due_date, data, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
       RETURNING *`,
      [id, template_id, customer_id, invoice_number, amount, currency, issue_date, due_date, data]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }
    throw error;
  }
});

// Update invoice
router.put('/:id', async (req: Request, res: Response) => {
  const { amount, currency, status, issue_date, due_date, data } = req.body;

  const result = await query(
    `UPDATE invoices
     SET amount = COALESCE($1, amount),
         currency = COALESCE($2, currency),
         status = COALESCE($3, status),
         issue_date = COALESCE($4, issue_date),
         due_date = COALESCE($5, due_date),
         data = COALESCE($6, data),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING *`,
    [amount, currency, status, issue_date, due_date, data, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  res.json(result.rows[0]);
});

// Download invoice as PDF
router.get('/:id/pdf', async (req: Request, res: Response) => {
  const invoiceResult = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);

  if (invoiceResult.rows.length === 0) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const invoice = invoiceResult.rows[0] as Invoice;

  const templateResult = await query('SELECT * FROM templates WHERE id = $1', [
    invoice.template_id,
  ]);

  if (templateResult.rows.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const template = templateResult.rows[0] as Template;

  try {
    const pdfBuffer = await generateInvoicePDF(invoice, template);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    res.send(pdfBuffer);

    // Log the download
    await query(
      `INSERT INTO invoice_logs (invoice_id, action, details)
       VALUES ($1, 'pdf_downloaded', $2)`,
      [invoice.id, JSON.stringify({ timestamp: new Date() })]
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Send invoice via email
router.post('/:id/send', async (req: Request, res: Response) => {
  const { recipient_email, message } = req.body;

  const invoiceResult = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);

  if (invoiceResult.rows.length === 0) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const invoice = invoiceResult.rows[0] as Invoice;

  const templateResult = await query('SELECT * FROM templates WHERE id = $1', [
    invoice.template_id,
  ]);

  if (templateResult.rows.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const template = templateResult.rows[0] as Template;

  try {
    const pdfBuffer = await generateInvoicePDF(invoice, template);

    const html = `
      <h2>Invoice #${invoice.invoice_number}</h2>
      <p>${message || 'Please find your invoice attached.'}</p>
      <p>Amount Due: ${invoice.currency} ${invoice.amount.toFixed(2)}</p>
      <p>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
    `;

    await sendEmail({
      to: recipient_email || invoice.data.customer_email,
      subject: `Invoice #${invoice.invoice_number}`,
      html,
    });

    // Update invoice status
    await query('UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      'sent',
      invoice.id,
    ]);

    // Log the email send
    await query(
      `INSERT INTO invoice_logs (invoice_id, action, details)
       VALUES ($1, 'email_sent', $2)`,
      [
        invoice.id,
        JSON.stringify({
          recipient: recipient_email || invoice.data.customer_email,
          timestamp: new Date(),
        }),
      ]
    );

    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// Delete invoice
router.delete('/:id', async (req: Request, res: Response) => {
  const result = await query('DELETE FROM invoices WHERE id = $1 RETURNING id', [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  res.status(204).send();
});

export default router;
