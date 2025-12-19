// backend/src/utils/validation.ts
import Joi from 'joi';

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3 || username.length > 50) {
    return { valid: false, error: 'Username must be between 3 and 50 characters' };
  }

  // Check for 'admin' in any form (case-insensitive)
  if (/admin/i.test(username)) {
    return { valid: false, error: 'Username cannot contain "admin"' };
  }

  // Only alphanumeric and underscore allowed
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
};

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required()
    .custom((value, helpers) => {
      const validation = validateUsername(value);
      if (!validation.valid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required()
});

export const productSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  active: Joi.boolean().optional()
});

export const cardSchema = Joi.object({
  cardNumber: Joi.string().creditCard().required(),
  cardHolderName: Joi.string().min(1).max(100).required(),
  expiryMonth: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required(),
  expiryYear: Joi.string().pattern(/^[0-9]{4}$/).required(),
  cvv: Joi.string().pattern(/^[0-9]{3,4}$/).required()
});
