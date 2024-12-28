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
exports.orderController = void 0;
const catchAsync_1 = __importDefault(require("../../Utilities/catchAsync"));
const sendResponse_1 = __importDefault(require("../../Utilities/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const orderService_1 = require("./orderService");
const Pick_1 = __importDefault(require("../../App/Common/Pick"));
const orderInterface_1 = require("./orderInterface");
const onlineOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orderService_1.orderService.onlineOrderData(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Order Create Successfully",
        data: result,
    });
}));
const createOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orderService_1.orderService.createNewOrderInToDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Order Create Successfully",
        data: result,
    });
}));
const getAllOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionsData = (0, Pick_1.default)(req.query, orderInterface_1.optionsPaginationFields);
    const result = yield orderService_1.orderService.getAllOrderFromDB(req.query, optionsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order retrieve successfully",
        data: result,
    });
}));
const getConfirmOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionsData = (0, Pick_1.default)(req.query, orderInterface_1.optionsPaginationFields);
    const result = yield orderService_1.orderService.getConfirmOrderFromDB(req.query, optionsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order retrieve successfully",
        data: result,
    });
}));
const getDeliveryOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionsData = (0, Pick_1.default)(req.query, orderInterface_1.optionsPaginationFields);
    const result = yield orderService_1.orderService.getDeliveryOrderFromDB(req.query, optionsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order retrieve successfully",
        data: result,
    });
}));
const getSingleOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const result = yield orderService_1.orderService.getSingleOrder(productId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Single Order successfully",
        data: result,
    });
}));
const updateOrderStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const result = yield orderService_1.orderService.updateOrderStatus(orderId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Status updates successfully",
        data: result,
    });
}));
const deleteOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderProductId } = req.params;
    const result = yield orderService_1.orderService.deleteOrderFromDB(orderProductId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order deleted successfully",
        data: result,
    });
}));
const pdfDownload = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pdfId } = req.params;
    const result = yield orderService_1.orderService.isPDFDownloadFromDB(pdfId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "PDF Download successfully",
        data: result,
    });
}));
//Admin Route For
const getAllOrdersForAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionsData = (0, Pick_1.default)(req.query, orderInterface_1.optionsPaginationFields);
    const result = yield orderService_1.orderService.getAllOrderForAdmin(req.query, optionsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order retrieve successfully",
        data: result,
    });
}));
const getAllReturnOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionsData = (0, Pick_1.default)(req.query, orderInterface_1.optionsPaginationFields);
    const result = yield orderService_1.orderService.getAllReturnOrder(req.query, optionsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order retrieve successfully",
        data: result,
    });
}));
const getDeliveryAndPrice = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orderService_1.orderService.updateDeliveryAndDiscount(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order retrieve successfully",
        data: result,
    });
}));
exports.orderController = {
    createOrder,
    onlineOrder,
    getAllOrders,
    getConfirmOrders,
    getSingleOrder,
    updateOrderStatus,
    deleteOrder,
    pdfDownload,
    getDeliveryOrders,
    getAllOrdersForAdmin,
    getAllReturnOrder,
    getDeliveryAndPrice,
};
