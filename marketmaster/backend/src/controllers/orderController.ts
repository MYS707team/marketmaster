// backend/src/controllers/orderController.ts
import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid order items' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 AND active = true',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ${item.productId} not found or inactive` });
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;

      // Update stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, product.id]
      );
    }

    // Create order
    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, transaction_ref) 
       VALUES ($1, $2, 'Pending', $3) 
       RETURNING *`,
      [req.user!.id, totalAmount, transactionRef]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) 
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.productId, item.productName, item.price, item.quantity]
      );
    }

    // Create transaction record
    const gatewayRef = `GW-${Math.floor(Math.random() * 1000000)}`;
    
    await client.query(
      `INSERT INTO transactions (order_id, amount, status, gateway_ref) 
       VALUES ($1, $2, 'SUCCESS', $3)`,
      [order.id, totalAmount, gatewayRef]
    );

    await client.query('COMMIT');

    // Fetch complete order with items
    const completeOrder = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'productId', oi.product_id,
                'name', oi.product_name,
                'price', oi.price,
                'quantity', oi.quantity
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [order.id]
    );

    res.status(201).json({ order: completeOrder.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'productId', oi.product_id,
                'name', oi.product_name,
                'price', oi.price,
                'quantity', oi.quantity
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user!.id]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.username,
              json_agg(json_build_object(
                'productId', oi.product_id,
                'name', oi.product_name,
                'price', oi.price,
                'quantity', oi.quantity
              )) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id, u.username
       ORDER BY o.created_at DESC`
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Paid', 'Processing', 'Completed', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
