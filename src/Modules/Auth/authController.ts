import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import { authService } from "./authService";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";

const userRegister = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.userRegisterIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "OTP sent to your email.",
    data: result,
  });
});
const verifyUserOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOtp(email, otp);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verify Successfully",
    data: result,
  });
});

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.userLoginFromDB(req.body);
  const { refreshToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Login Successfully",
    data: {
      accessToken: result.accessToken,
    },
  });
});

const googleLogin = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authService.googleLogin(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Google Sing UP Successfully",
      data: result.accessToken,
    });
  }
);

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access Token Generated Successfully",
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await authService.changePassword(user, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Change Successfully",
      data: result,
    });
  }
);

export const authController = {
  userRegister,
  userLogin,
  refreshToken,
  changePassword,
  verifyUserOtp,
  googleLogin,
};
