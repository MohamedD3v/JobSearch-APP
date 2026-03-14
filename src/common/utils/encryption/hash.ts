import * as bcrypt from 'bcrypt';

export const hash = async (
  item: string,
  saltRounds: number = 10,
): Promise<string> => {
  return bcrypt.hash(item, saltRounds);
};

export const compare = async (
  item: string,
  hashedItem: string,
): Promise<boolean> => {
  return bcrypt.compare(item, hashedItem);
};
