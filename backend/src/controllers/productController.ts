// backend/src/controllers/productController.ts
import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { productSchema } from '../utils/validation';

export const getActiveProducts = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, stock, image_url, active, created_at 
       FROM products 
       WHERE active = true 
       ORDER BY created_at DESC`
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, stock, image_url, active, created_at 
       FROM products 
       ORDER BY created_at DESC`
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creating product - Body:', req.body);
    console.log('Creating product - File:', req.file);

    const { error, value } = productSchema.validate(req.body);
    
    if (error) {
      console.error('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, price, stock, active } = value;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Rasm yuklangan bo'lishi kerak
    if (!imageUrl) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url, active, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description || '', price, stock, imageUrl, active !== false, req.user!.id]
    );

    console.log('Product created successfully:', result.rows[0]);
    res.status(201).json({ product: result.rows[0] });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message 
    });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, price, stock, active } = value;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    let query = `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, active = $5`;
    const params: any[] = [name, description || '', price, stock, active !== false];

    if (imageUrl) {
      query += `, image_url = $${params.length + 1}`;
      params.push(imageUrl);
    }

    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
