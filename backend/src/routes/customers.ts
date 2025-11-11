import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all customers
router.get('/', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM customers ORDER BY name ASC');
  res.json(result.rows);
});

// Get single customer
router.get('/:id', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(result.rows[0]);
});

// Create customer
router.post('/', async (req: Request, res: Response) => {
  const { name, email, address, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const id = uuidv4();

  try {
    const result = await query(
      `INSERT INTO customers (id, name, email, address, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name, email, address, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    throw error;
  }
});

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  const { name, email, address, phone } = req.body;

  const result = await query(
    `UPDATE customers
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         address = COALESCE($3, address),
         phone = COALESCE($4, phone)
     WHERE id = $5
     RETURNING *`,
    [name, email, address, phone, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json(result.rows[0]);
});

// Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  const result = await query('DELETE FROM customers WHERE id = $1 RETURNING id', [
    req.params.id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.status(204).send();
});

export default router;
