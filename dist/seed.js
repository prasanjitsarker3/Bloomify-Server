"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const Prisma_1 = __importDefault(require("./App/Common/Prisma"));
const config_1 = __importDefault(require("./App/config"));
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!config_1.default.superAdmin || !config_1.default.superAdminPassword) {
            throw new Error("Super Admin email or password is not defined in the environment variables.");
        }
        const existingSuperAdmin = yield Prisma_1.default.user.findFirst({
            where: {
                email: config_1.default.superAdmin,
            },
        });
        if (existingSuperAdmin) {
            console.log("Super Admin already exists!");
        }
        else {
            const hashedPassword = yield bcrypt.hash(config_1.default.superAdminPassword, 12);
            const newSuperAdmin = yield Prisma_1.default.user.create({
                data: {
                    email: config_1.default.superAdmin,
                    password: hashedPassword,
                    name: "ADMIN",
                    role: client_1.UserRole.admin,
                    needPasswordChange: false,
                    status: "ACTIVE",
                },
            });
            console.log("Super Admin created successfully!", newSuperAdmin);
        }
    }
    catch (err) {
        console.error("Error creating Super Admin:", err);
    }
    finally {
        yield Prisma_1.default.$disconnect();
    }
});
exports.seedSuperAdmin = seedSuperAdmin;
(0, exports.seedSuperAdmin)();
