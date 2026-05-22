import { registerSchema, loginSchema } from './auth.schema.js';
import { UserModel }                  from '../users/user.model.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken }                  from '../../utils/jwt.js';
import { asyncHandler }               from '../../utils/asyncHandler.js';
import { ApiError }                   from '../../utils/apiError.js';

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existing = await UserModel.findOne({ email: data.email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const { hash, salt } = hashPassword(data.password);

  const user = await UserModel.create({
    name:         data.name,
    email:        data.email,
    passwordHash: hash,
    passwordSalt: salt,
    role:         'member',   // always member — admins are promoted manually in DB
  });

  const token = signToken({ sub: user._id, role: user.role });

  res.status(201).json({
    message: 'Account created',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await UserModel.findOne({ email: data.email });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = verifyPassword(data.password, user.passwordHash, user.passwordSalt);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ sub: user._id, role: user.role });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
