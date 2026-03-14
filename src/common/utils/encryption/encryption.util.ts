import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

export const encrypt = (item: string, secret: string): string => {
  const iv = randomBytes(16);
  const key = createHash('sha256').update(String(secret)).digest();
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(item);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (encryptedItem: string, secret: string): string => {
  const textParts = encryptedItem.split(':');
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = createHash('sha256').update(String(secret)).digest();
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
