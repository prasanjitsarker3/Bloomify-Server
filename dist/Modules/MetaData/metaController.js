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
exports.metaController = void 0;
const catchAsync_1 = __importDefault(require("../../Utilities/catchAsync"));
const metaService_1 = require("./metaService");
const sendResponse_1 = __importDefault(require("../../Utilities/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../App/Error/ApiError"));
const adminDashboardMetaData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield metaService_1.metaService.adminDashboardMetaData();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "MetaData Retrieve Successfully",
        data: result,
    });
}));
const moderatorDashboardData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield metaService_1.metaService.moderatorDashboardData();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "MetaData Retrieve Successfully",
        data: result,
    });
}));
const getDashboardMonthlyData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { selectedMonth } = req.query;
    if (!selectedMonth || typeof selectedMonth !== "string") {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or missing 'selectedMonth' parameter");
    }
    const result = yield metaService_1.metaService.getMonthlyDataDownload({ selectedMonth });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "MetaData Retrieved Successfully",
        data: result,
    });
}));
exports.metaController = {
    adminDashboardMetaData,
    moderatorDashboardData,
    getDashboardMonthlyData,
};
