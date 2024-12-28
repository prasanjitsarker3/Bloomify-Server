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
exports.categoryService = void 0;
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const paginationCalculation_1 = __importDefault(require("../../Utilities/paginationCalculation"));
const categoryInterface_1 = require("./categoryInterface");
const createdCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Prisma_1.default.category.create({
        data: payload,
    });
    return result;
});
const getAllCategoryFormDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (params.searchTerm) {
        andCondition.push({
            OR: categoryInterface_1.categorySearchingField.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    andCondition.push({
        isDeleted: false,
    });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.category.findMany({
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
    });
    const total = yield Prisma_1.default.category.count({
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
const categoryDeletedFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield Prisma_1.default.category.findUniqueOrThrow({
        where: { id },
    });
    const result = yield Prisma_1.default.category.update({
        where: { id },
        data: { isDeleted: true },
    });
    return result;
});
const categoryFeatureToggle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // const category = await prisma.category.findUnique({
    //   where: {
    //     id: id,
    //   },
    //   select: {
    //     isFeature: true,
    //   },
    // });
    // const result = await prisma.category.update({
    //   where: {
    //     id: id,
    //   },
    //   data: {
    //     isFeature: !category?.isFeature,
    //   },
    // });
    // return result;
});
exports.categoryService = {
    createdCategory,
    getAllCategoryFormDB,
    categoryDeletedFromDB,
    categoryFeatureToggle,
};
