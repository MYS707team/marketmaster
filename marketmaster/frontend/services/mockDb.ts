import { User, Product, Order, UserRole, OrderStatus, Transaction } from '../types';

/**
 * MOCK DATABASE SERVICE
 * 
 * In a real application, this would be a Node.js/Express backend connecting to PostgreSQL.
 * Here, we simulate the database logic, constraints, and initial seeding using localStorage
 * to provide a functional demo within the browser environment.
 */

const STORAGE_KEYS = {
  USERS: 'mm_users',
  PRODUCTS: 'mm_products',
  ORDERS: 'mm_orders',
  TRANSACTIONS: 'mm_transactions',
};

// Initial Seed Data
const INITIAL_ADMIN = {
  id: 'admin-seed-001',
  username: 'IYodgorUz',
  email: 'yodgormeliyev025@gmail.com',
  passwordHash: 'hashed_MYS707', // In real app: bcrypt hash
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with industry-leading noise cancellation.',
    price: 299.99,
    stock: 50,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    active: true,
  },
  {
    id: 'p2',
    name: 'Ergonomic Office Chair',
    description: 'Mesh back chair with lumbar support for long working hours.',
    price: 199.50,
    stock: 20,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    active: true,
  },
  {
    id: 'p3',
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile blue switches.',
    price: 89.99,
    stock: 100,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    active: true,
  },
  {
    id: 'p4',
    name: '4K Monitor 27"',
    description: 'Ultra HD IPS monitor perfect for design and gaming.',
    price: 349.00,
    stock: 0, // Out of stock example
    imageUrl: 'https://picsum.photos/400/400?random=4',
    active: true,
  }
];

// Helper to simulate DB Delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDB {
  constructor() {
    this.init();
  }

  private init() {
    // Seed Admin if not exists
    const users = this.getUsers();
    if (!users.find(u => u.username === INITIAL_ADMIN.username)) {
      users.push(INITIAL_ADMIN);
      this.save(STORAGE_KEYS.USERS, users);
    }

    // Seed Products if empty
    const products = this.getProductsRaw();
    if (products.length === 0) {
      this.save(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // --- User Operations ---
  getUsers(): User[] {
    return this.get<User>(STORAGE_KEYS.USERS);
  }

  createUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    this.save(STORAGE_KEYS.USERS, users);
    return user;
  }

  // --- Product Operations ---
  getProductsRaw(): Product[] {
    return this.get<Product>(STORAGE_KEYS.PRODUCTS);
  }

  async getActiveProducts(): Promise<Product[]> {
    await delay(300);
    return this.getProductsRaw().filter(p => p.active);
  }

  async getAllProductsAdmin(): Promise<Product[]> {
    await delay(300);
    return this.getProductsRaw();
  }

  async saveProduct(product: Product): Promise<Product> {
    await delay(400);
    const products = this.getProductsRaw();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    this.save(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const products = this.getProductsRaw().filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, products);
  }

  // --- Order Operations ---
  getOrders(): Order[] {
    return this.get<Order>(STORAGE_KEYS.ORDERS);
  }

  async createOrder(order: Order): Promise<Order> {
    await delay(600);
    
    // 1. Validate Stock (Transaction simulation)
    const products = this.getProductsRaw();
    
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.name} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${item.name}`);
      
      // Decrease stock
      product.stock -= item.quantity;
    }

    // 2. Save Product Updates
    this.save(STORAGE_KEYS.PRODUCTS, products);

    // 3. Save Order
    const orders = this.getOrders();
    orders.unshift(order); // Add to top
    this.save(STORAGE_KEYS.ORDERS, orders);

    // 4. Create Transaction Record
    const transactions = this.get<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const transaction: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderId: order.id,
      amount: order.totalAmount,
      status: 'SUCCESS', // Simulating instant payment
      date: new Date().toISOString(),
      gatewayRef: `GW-${Math.floor(Math.random() * 1000000)}`
    };
    transactions.unshift(transaction);
    this.save(STORAGE_KEYS.TRANSACTIONS, transactions);

    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    await delay(300);
    return this.getOrders().filter(o => o.userId === userId);
  }

  async getAllOrdersAdmin(): Promise<Order[]> {
    await delay(300);
    return this.getOrders();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await delay(300);
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.save(STORAGE_KEYS.ORDERS, orders);
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    await delay(300);
    return this.get<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  }
}

export const db = new MockDB();
