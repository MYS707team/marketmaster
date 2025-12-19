import { db } from './mockDb';
import { User, UserRole, AuthResponse } from '../types';

// Simple "hashing" for demo purposes. 
// In a real app, this happens on backend with bcrypt.
const hashPassword = (pwd: string) => `hashed_${pwd}`;

export const authService = {
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = db.getUsers();
    // Allow login by Email OR Username
    const user = users.find(u => 
      (u.email.toLowerCase() === identifier.toLowerCase() || u.username === identifier) &&
      u.passwordHash === hashPassword(password)
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Simulate JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    // Store in Session
    sessionStorage.setItem('mm_user', JSON.stringify(user));
    sessionStorage.setItem('mm_token', token);

    return { user, token };
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = db.getUsers();
    
    if (users.some(u => u.username === username)) throw new Error('Username already taken');
    if (users.some(u => u.email === email)) throw new Error('Email already registered');

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      role: UserRole.CUSTOMER, // Default role
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    sessionStorage.setItem('mm_user', JSON.stringify(newUser));
    sessionStorage.setItem('mm_token', token);

    return { user: newUser, token };
  },

  logout: () => {
    sessionStorage.removeItem('mm_user');
    sessionStorage.removeItem('mm_token');
    window.location.hash = '#/login';
  },

  getCurrentUser: (): User | null => {
    const u = sessionStorage.getItem('mm_user');
    return u ? JSON.parse(u) : null;
  }
};
