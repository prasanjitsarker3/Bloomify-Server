"use strict";
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
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const authInterface_1 = require("./authInterface");
const ApiError_1 = __importDefault(require("../../App/Error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const createToken_1 = require("../../App/Common/createToken");
const config_1 = __importDefault(require("../../App/config"));
const veriflyToken_1 = require("../../Utilities/veriflyToken");
const sendMail_1 = __importDefault(require("../../Utilities/sendMail"));
const verifyGoogleToken_1 = require("../../Utilities/verifyGoogleToken");
const userRegisterIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield Prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (existingUser) {
        throw new ApiError_1.default(200, "User already exists");
    }
    const hashPassword = yield bcrypt_1.default.hash(payload.password, 12);
    const otp = (0, authInterface_1.generateOtp)();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const result = yield Prisma_1.default.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashPassword,
            role: payload.role || "user",
            otp,
            otpExpires,
        },
        select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
        },
    });
    yield (0, sendMail_1.default)(payload.email, "OTP Verification", `Your OTP for verification is ${otp}. It is valid for 5 minutes.`);
    return result;
});
const verifyOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found.");
    }
    if (user.isVerified) {
        throw new ApiError_1.default(404, "User is already verified.");
    }
    if (!user.otpExpires || new Date(user.otpExpires) < new Date()) {
        throw new ApiError_1.default(404, "Invalid or expired OTP.");
    }
    if (user.otp !== otp) {
        throw new Error("Invalid OTP.");
    }
    // Mark the user as verified and clear OTP
    const result = yield Prisma_1.default.user.update({
        where: { email },
        data: {
            isVerified: true,
            otp: null,
            otpExpires: null,
        },
    });
    return result;
});
const userLoginFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Not Found !");
    }
    if (user.isVerified === false) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Not Verify!");
    }
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Incorrect password");
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.accessToken, config_1.default.accessTokenExpireDate);
    const refreshToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.refreshToken, config_1.default.refreshTokenExpireDate);
    return {
        accessToken,
        refreshToken,
    };
});
const googleLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.token) {
        throw new ApiError_1.default(400, "Token is required!");
    }
    const decodedData = yield (0, verifyGoogleToken_1.verifyGoogleToken)(payload.token);
    if (!decodedData) {
        throw new ApiError_1.default(401, "Invalid token!");
    }
    const { email, name, picture } = decodedData;
    let user = yield Prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        user = yield Prisma_1.default.user.create({
            data: {
                email,
                name,
                password: email,
                role: client_1.UserRole.user,
                isVerified: true,
                profile: picture || null,
            },
        });
        console.log("New User Created:", user);
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.accessToken, config_1.default.accessTokenExpireDate);
    const refreshToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.refreshToken, config_1.default.refreshTokenExpireDate);
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = (0, veriflyToken_1.verifyToken)(token, config_1.default.refreshToken);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Your are not authorized !");
    }
    const userData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Data Not Found !");
    }
    const jwtPayload = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.accessToken, config_1.default.accessTokenExpireDate);
    return {
        accessToken,
    };
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Data Not Found !");
    }
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Password doesn't match !");
    }
    const hashPassword = yield bcrypt_1.default.hash(payload.newPassword, 12);
    yield Prisma_1.default.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashPassword,
            needPasswordChange: false,
        },
    });
    return {
        message: "Password Change Successfully ",
    };
});
exports.authService = {
    userRegisterIntoDB,
    userLoginFromDB,
    refreshToken,
    changePassword,
    verifyOtp,
    googleLogin,
};
