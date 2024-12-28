export type ILogin = {
  email: string;
  password: string;
  authToken: string;
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();
