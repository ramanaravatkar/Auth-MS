import jwt from 'jsonwebtoken';

export const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || '';
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};
