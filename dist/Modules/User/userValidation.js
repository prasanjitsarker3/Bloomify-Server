"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminValidationSchema = exports.updateUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const createAdminSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({
            required_error: "Name is required",
        }),
        email: zod_1.default.string({
            required_error: "Email is required",
        }),
        password: zod_1.default.string({
            required_error: "Password is required",
        }),
    }),
});
exports.updateUserSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string().optional(),
        bio: zod_1.default.string().optional(),
        profilePhoto: zod_1.default.string().optional(),
        coverPhoto: zod_1.default.string().optional(),
        address: zod_1.default.string().optional(),
    }),
});
exports.adminValidationSchema = {
    createAdminSchema,
};
