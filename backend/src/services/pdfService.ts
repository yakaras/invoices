import PDFDocument from 'pdfkit';
import { Invoice, Template } from '../types';
import { Readable } from 'stream';

export async function generateInvoicePDF(
  invoice: Invoice,
  template: Template
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with company info
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(invoice.data.company_name, { align: 'left' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(invoice.data.company_address || '', { align: 'left' });
      doc.text(invoice.data.company_email || '', { align: 'left' });

      doc.moveDown();

      // Invoice title and details
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'right' });

      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice #: ${invoice.invoice_number}`, { align: 'right' });
      doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, {
        align: 'right',
      });
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, {
        align: 'right',
      });

      doc.moveDown();

      // Bill To section
      doc.fontSize(12).font('Helvetica-Bold').text('BILL TO:');
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(invoice.data.customer_name, { indent: 20 });
      doc.text(invoice.data.customer_email || '', { indent: 20 });
      doc.text(invoice.data.customer_address || '', { indent: 20 });

      doc.moveDown();

      // Line items table
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 300;
      const col3 = 400;
      const col4 = 500;

      // Header
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', col1, tableTop)
        .text('Qty', col2, tableTop)
        .text('Unit Price', col3, tableTop)
        .text('Total', col4, tableTop);

      let y = tableTop + 25;

      // Line items
      invoice.data.line_items?.forEach((item) => {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(item.description, col1, y)
          .text(item.quantity.toString(), col2, y)
          .text(`$${item.unit_price.toFixed(2)}`, col3, y)
          .text(`$${item.total.toFixed(2)}`, col4, y);

        y += 25;
      });

      // Total
      doc.moveTo(col1, y).lineTo(550, y).stroke();
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Total: ${invoice.currency} ${invoice.amount.toFixed(2)}`, col4 - 80, y + 10);

      doc.moveDown(2);

      // Notes
      if (invoice.data.notes) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Notes:', { underline: true });
        doc.fontSize(9).text(invoice.data.notes);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function renderTemplateWithData(template: Template, data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [template.content.pageSize.width, template.content.pageSize.height],
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Render template elements
      template.content.elements.forEach((element) => {
        const xPos = element.x;
        const yPos = element.y;

        switch (element.type) {
          case 'text':
          case 'field':
            const text = element.fieldName
              ? data[element.fieldName.replace(/[{}]/g, '')] || element.text || ''
              : element.text || '';

            doc
              .fontSize(element.fontSize || 12)
              .font(element.fontFamily || 'Helvetica')
              .text(text.toString(), xPos, yPos, {
                width: element.width,
                height: element.height,
              });
            break;

          case 'image':
            if (element.src) {
              doc.image(element.src, xPos, yPos, {
                width: element.width,
                height: element.height,
              });
            }
            break;

          case 'rectangle':
            if (element.fill) {
              doc.fillColor(element.fill);
              doc.rect(xPos, yPos, element.width, element.height).fill();
            }
            if (element.stroke) {
              doc.strokeColor(element.stroke);
              doc.rect(xPos, yPos, element.width, element.height).stroke();
            }
            break;

          case 'line':
            if (element.stroke) {
              doc.strokeColor(element.stroke);
              doc.moveTo(xPos, yPos).lineTo(xPos + element.width, yPos + element.height).stroke();
            }
            break;
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
