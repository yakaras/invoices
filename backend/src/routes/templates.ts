import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';
import { Template } from '../types';

const router = Router();

// Get all templates
router.get('/', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM templates ORDER BY created_at DESC');
  res.json(result.rows);
});

// Get single template
router.get('/:id', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM templates WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(result.rows[0]);
});

// Create template
router.post('/', async (req: Request, res: Response) => {
  const { name, description, content, logo_url } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  const id = uuidv4();

  const result = await query(
    `INSERT INTO templates (id, name, description, content, logo_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, name, description, content, logo_url]
  );

  res.status(201).json(result.rows[0]);
});

// Update template
router.put('/:id', async (req: Request, res: Response) => {
  const { name, description, content, logo_url } = req.body;

  const result = await query(
    `UPDATE templates
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         content = COALESCE($3, content),
         logo_url = COALESCE($4, logo_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [name, description, content, logo_url, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json(result.rows[0]);
});

// Delete template
router.delete('/:id', async (req: Request, res: Response) => {
  const result = await query('DELETE FROM templates WHERE id = $1 RETURNING id', [
    req.params.id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.status(204).send();
});

export default router;
