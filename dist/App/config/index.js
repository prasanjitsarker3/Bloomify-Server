"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join((process.cwd(), ".env")) });
exports.default = {
    PORT: process.env.PORT,
    bcryptSalt: process.env.bcryptSalt,
    accessToken: process.env.accessToken,
    accessTokenExpireDate: process.env.accessTokenExpireDate,
    refreshToken: process.env.refreshToken,
    refreshTokenExpireDate: process.env.refreshTokenExpireDate,
    superAdmin: process.env.superAdmin,
    superAdminPassword: process.env.superAdminPassword,
};
