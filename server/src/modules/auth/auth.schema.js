import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2,  'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8,  'Password must be at least 8 characters'),
  // role is intentionally NOT accepted from the client — everyone starts as 'member'
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
