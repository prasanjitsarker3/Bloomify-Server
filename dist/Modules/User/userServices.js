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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const userConstant_1 = require("./userConstant");
const client_1 = require("@prisma/client");
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const paginationCalculation_1 = __importDefault(require("../../Utilities/paginationCalculation"));
const getAllUserFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (params.searchTerm) {
        andCondition.push({
            OR: userConstant_1.userSearchingField.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andCondition.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    andCondition.push({
        status: client_1.UserStatus.ACTIVE || client_1.UserStatus.BLOCKED,
    });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder
            ? {
                [sortBy]: sortOrder,
            }
            : {
                createdAt: "asc",
            },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
        },
    });
    const total = yield Prisma_1.default.user.count({
        where: whereCondition,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const myProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const profileData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: userData.email,
        },
    });
    return profileData;
});
const profileUpdateFromDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: id,
        },
    });
    const updatedUser = yield Prisma_1.default.user.update({
        where: {
            id: userData.id,
        },
        data: {
            //@ts-ignore
            status: payload.status,
        },
    });
    return updatedUser;
});
const deletedUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const result = yield Prisma_1.default.user.update({
        where: {
            id: user.id,
        },
        data: {
            status: client_1.UserStatus.DELETED,
        },
    });
    return result;
});
exports.userServices = {
    getAllUserFromDB,
    myProfileFromDB,
    profileUpdateFromDB,
    deletedUser,
};
