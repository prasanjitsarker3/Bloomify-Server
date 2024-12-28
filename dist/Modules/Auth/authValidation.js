"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginSchema = exports.userRegistrationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userRegistrationSchema = zod_1.default.object({
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
exports.userLoginSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default.string({
            required_error: "Email is required",
        }),
        password: zod_1.default.string({
            required_error: "Password is required",
        }),
    }),
});
