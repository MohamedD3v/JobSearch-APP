import * as jwt from 'jsonwebtoken';

export const generateToken = ({
  payload,
  signature = process.env.JWT_SECRET || 'secret',
  options = {},
}: {
  payload: object;
  signature?: string;
  options?: jwt.SignOptions;
}): string => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = ({
  token,
  signature = process.env.JWT_SECRET || 'secret',
}: {
  token: string;
  signature?: string;
}): any => {
  try {
    return jwt.verify(token, signature);
  } catch {
    return null;
  }
};
