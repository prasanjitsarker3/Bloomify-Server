import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });
export default {
  PORT: process.env.PORT,
  bcryptSalt: process.env.bcryptSalt,
  accessToken: process.env.accessToken,
  accessTokenExpireDate: process.env.accessTokenExpireDate,
  refreshToken: process.env.refreshToken,
  refreshTokenExpireDate: process.env.refreshTokenExpireDate,
  superAdmin: process.env.superAdmin,
  superAdminPassword: process.env.superAdminPassword,
};
