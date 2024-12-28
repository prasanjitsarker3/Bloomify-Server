import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import { bannerService } from "./bannerService";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";
import pick from "../../App/Common/Pick";
import {
  optionsPaginationFields,
  userFilterableFields,
} from "../User/userConstant";

const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await bannerService.createBanner(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Banner Create Successfully",
    data: result,
  });
});

const getAllBanner = catchAsync(async (req: Request, res: Response) => {
  const filterData = pick(req.query, userFilterableFields);
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await bannerService.getAllBanner(filterData, optionsData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banner Fetch Successfully",
    data: result,
  });
});
const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const { deleteId } = req.params;
  const result = await bannerService.bannerDelete(deleteId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banner Delete Successfully",
    data: result,
  });
});

export const bannerController = {
  createBanner,
  getAllBanner,
  deleteBanner,
};
