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
exports.categoryController = void 0;
const catchAsync_1 = __importDefault(require("../../Utilities/catchAsync"));
const categoryService_1 = require("./categoryService");
const sendResponse_1 = __importDefault(require("../../Utilities/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const Pick_1 = __importDefault(require("../../App/Common/Pick"));
const userConstant_1 = require("../User/userConstant");
const categoryInterface_1 = require("./categoryInterface");
const createdCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield categoryService_1.categoryService.createdCategory(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Category Create Successfully",
        data: result,
    });
}));
const allCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filterData = (0, Pick_1.default)(req.query, userConstant_1.userFilterableFields);
    const optionsData = (0, Pick_1.default)(req.query, categoryInterface_1.optionsPaginationFields);
    const result = yield categoryService_1.categoryService.getAllCategoryFormDB(filterData, optionsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Category Fetch Successfully",
        data: result,
    });
}));
const deletedCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield categoryService_1.categoryService.categoryDeletedFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Category Delete Successfully",
        data: result,
    });
}));
const categoryToggle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { toggleId } = req.params;
    const result = yield categoryService_1.categoryService.categoryFeatureToggle(toggleId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Category Toggle Successfully",
        data: result,
    });
}));
exports.categoryController = {
    createdCategory,
    allCategory,
    deletedCategory,
    categoryToggle,
};
