import { UserModel } from '../modules/users/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Verifies Bearer JWT and attaches req.user
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authorization Bearer token required');
  }

  const decoded = verifyToken(token);
  const user = await UserModel.findById(decoded.sub).select('-passwordHash -passwordSalt');
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
});

// Checks req.user has one of the given global roles (admin/member)
export const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new ApiError(403, 'You do not have permission'));
  }
  next();
};
