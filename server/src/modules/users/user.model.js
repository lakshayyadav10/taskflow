import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    role: {
      type:    String,
      enum:    ['admin', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

// Strip password fields from JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordSalt;
    return ret;
  },
});

export const UserModel = mongoose.model('User', userSchema);
