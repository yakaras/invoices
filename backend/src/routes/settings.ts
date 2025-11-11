import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get company settings
router.get('/', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM company_settings LIMIT 1');

  if (result.rows.length === 0) {
    // Return default settings if none exist
    return res.json({
      company_name: '',
      company_address: '',
      company_email: '',
      company_phone: '',
      logo_url: '',
      tax_id: '',
      default_currency: 'USD',
      invoice_prefix: 'INV',
    });
  }

  res.json(result.rows[0]);
});

// Update company settings
router.post('/', async (req: Request, res: Response) => {
  const {
    company_name,
    company_address,
    company_email,
    company_phone,
    logo_url,
    tax_id,
    default_currency,
    invoice_prefix,
  } = req.body;

  // Check if settings already exist
  const existing = await query('SELECT id FROM company_settings LIMIT 1');

  if (existing.rows.length > 0) {
    // Update existing
    const result = await query(
      `UPDATE company_settings
       SET company_name = COALESCE($1, company_name),
           company_address = COALESCE($2, company_address),
           company_email = COALESCE($3, company_email),
           company_phone = COALESCE($4, company_phone),
           logo_url = COALESCE($5, logo_url),
           tax_id = COALESCE($6, tax_id),
           default_currency = COALESCE($7, default_currency),
           invoice_prefix = COALESCE($8, invoice_prefix),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        company_name,
        company_address,
        company_email,
        company_phone,
        logo_url,
        tax_id,
        default_currency,
        invoice_prefix,
        existing.rows[0].id,
      ]
    );

    return res.json(result.rows[0]);
  } else {
    // Create new
    const id = uuidv4();
    const result = await query(
      `INSERT INTO company_settings
       (id, company_name, company_address, company_email, company_phone, logo_url, tax_id, default_currency, invoice_prefix)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        company_name,
        company_address,
        company_email,
        company_phone,
        logo_url,
        tax_id,
        default_currency || 'USD',
        invoice_prefix || 'INV',
      ]
    );

    res.status(201).json(result.rows[0]);
  }
});

export default router;
