import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import { productService } from "./productService";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";
import { productFilterableFields } from "./productInterface";
import pick from "../../App/Common/Pick";
import { optionsPaginationFields } from "../User/userConstant";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.createdNewProduct(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product Create Successfully",
    data: result,
  });
});

const getAllProduct = catchAsync(async (req: Request, res: Response) => {
  const filterData = pick(req.query, productFilterableFields);
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await productService.getAllProductFromDB(
    filterData,
    optionsData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Fetch Successfully",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await productService.getSingleProduct(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Fetch Successfully",
    data: result,
  });
});

const getSingleProductUpdate = catchAsync(
  async (req: Request, res: Response) => {
    const result = await productService.getSingleProductUpdate(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product Update Successfully",
      data: result,
    });
  }
);

const getSingleProductDelete = catchAsync(
  async (req: Request, res: Response) => {
    const { deleteId } = req.params;
    const result = await productService.getSingleProductSoftDelete(deleteId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product Delete Successfully",
      data: result,
    });
  }
);
const getTopProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.topProductFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top Product Successfully",
    data: result,
  });
});
const getNewProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.newProductFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New Product Successfully",
    data: result,
  });
});
const topDiscountProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.fetchTopDiscountedProductsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New Product Successfully",
    data: result,
  });
});

const cartFilteringData = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.cartFilteringData();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Woman Product Successfully",
    data: result,
  });
});

export const productController = {
  createProduct,
  getAllProduct,
  getSingleProduct,
  getSingleProductUpdate,
  getSingleProductDelete,
  getTopProduct,
  getNewProduct,
  topDiscountProduct,
  cartFilteringData,
};
