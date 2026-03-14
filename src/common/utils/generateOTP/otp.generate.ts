export const generateOtp = (): string => {
  return String(Math.floor(Math.random() * (800000 - 200000) + 200000));
};
