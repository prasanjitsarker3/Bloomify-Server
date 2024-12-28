import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";
import { orderService } from "./orderService";
import pick from "../../App/Common/Pick";
import { optionsPaginationFields } from "./orderInterface";

const onlineOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.onlineOrderData(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order Create Successfully",
    data: result,
  });
});

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.createNewOrderInToDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order Create Successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await orderService.getAllOrderFromDB(req.query, optionsData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieve successfully",
    data: result,
  });
});

const getConfirmOrders = catchAsync(async (req: Request, res: Response) => {
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await orderService.getConfirmOrderFromDB(
    req.query,
    optionsData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieve successfully",
    data: result,
  });
});
const getDeliveryOrders = catchAsync(async (req: Request, res: Response) => {
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await orderService.getDeliveryOrderFromDB(
    req.query,
    optionsData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieve successfully",
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await orderService.getSingleOrder(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Order successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await orderService.updateOrderStatus(orderId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Status updates successfully",
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderProductId } = req.params;
  const result = await orderService.deleteOrderFromDB(orderProductId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});
const pdfDownload = catchAsync(async (req: Request, res: Response) => {
  const { pdfId } = req.params;
  const result = await orderService.isPDFDownloadFromDB(pdfId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "PDF Download successfully",
    data: result,
  });
});

//Admin Route For

const getAllOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await orderService.getAllOrderForAdmin(req.query, optionsData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieve successfully",
    data: result,
  });
});
const getAllReturnOrder = catchAsync(async (req: Request, res: Response) => {
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await orderService.getAllReturnOrder(req.query, optionsData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieve successfully",
    data: result,
  });
});
const getDeliveryAndPrice = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.updateDeliveryAndDiscount(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieve successfully",
    data: result,
  });
});

export const orderController = {
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
