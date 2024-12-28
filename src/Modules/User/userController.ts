import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import { userServices } from "./userServices";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";
import pick from "../../App/Common/Pick";
import { optionsPaginationFields, userFilterableFields } from "./userConstant";

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const filterData = pick(req.query, userFilterableFields);
  const optionsData = pick(req.query, optionsPaginationFields);
  const result = await userServices.getAllUserFromDB(filterData, optionsData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Fetch Successfully",
    data: result,
  });
});

const myProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await userServices.myProfileFromDB(user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile Get Successfully",
      data: result,
    });
  }
);
const profileUpdate = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await userServices.profileUpdateFromDB(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile Update Successfully",
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { deleteId } = req.params;
  const result = await userServices.deletedUser(deleteId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Deleted Successfully",
    data: result,
  });
});

export const userController = {
  getAllUser,
  myProfile,
  profileUpdate,
  deleteUser,
};
