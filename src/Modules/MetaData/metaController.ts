import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import { metaService } from "./metaService";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../App/Error/ApiError";

const adminDashboardMetaData = catchAsync(
  async (req: Request, res: Response) => {
    const result = await metaService.adminDashboardMetaData();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "MetaData Retrieve Successfully",
      data: result,
    });
  }
);
const moderatorDashboardData = catchAsync(
  async (req: Request, res: Response) => {
    const result = await metaService.moderatorDashboardData();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "MetaData Retrieve Successfully",
      data: result,
    });
  }
);

const getDashboardMonthlyData = catchAsync(
  async (req: Request, res: Response) => {
    const { selectedMonth } = req.query;

    if (!selectedMonth || typeof selectedMonth !== "string") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or missing 'selectedMonth' parameter"
      );
    }

    const result = await metaService.getMonthlyDataDownload({ selectedMonth });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "MetaData Retrieved Successfully",
      data: result,
    });
  }
);

export const metaController = {
  adminDashboardMetaData,
  moderatorDashboardData,
  getDashboardMonthlyData,
};
