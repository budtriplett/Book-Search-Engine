import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = (token: string) => {
  if (!token) {
    return null;
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const cleanedToken = token.replace(/^Bearer\s/, '');
    const decoded = jwt.verify(cleanedToken, secretKey) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '2h' });
};

export const contextMiddleware = async ({ req }: { req: { headers: { authorization?: string } } }) => {
  const token = req.headers.authorization ?? '';
  const user = authenticateToken(token);
  return { user };
};