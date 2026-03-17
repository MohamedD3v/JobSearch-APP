import * as jwt from 'jsonwebtoken';

export const generateToken = ({
  payload,
  signature = process.env.JWT_SECRET,
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
  signature = process.env.JWT_SECRET,
}: {
  token: string;
  signature?: string;
}): any => {
  return jwt.verify(token, signature);
};
