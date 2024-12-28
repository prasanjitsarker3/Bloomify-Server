import { UserRole, UserStatus } from "@prisma/client";
import { IUser } from "../User/userInterface";
import bcrypt from "bcrypt";
import prisma from "../../App/Common/Prisma";
import { generateOtp, IChangePassword, ILogin } from "./authInterface";
import ApiError from "../../App/Error/ApiError";
import httpStatus from "http-status";
import { JwtPayload, verify } from "jsonwebtoken";
import { createToken } from "../../App/Common/createToken";
import config from "../../App/config";
import { verifyToken } from "../../Utilities/veriflyToken";
import { ITokenUser } from "../../App/Common/authType";
import sendMail from "../../Utilities/sendMail";
import { verifyGoogleToken } from "../../Utilities/verifyGoogleToken";

const userRegisterIntoDB = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(200, "User already exists");
  }
  const hashPassword: string = await bcrypt.hash(payload.password, 12);
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashPassword,
      role: payload.role || "user",
      otp,
      otpExpires,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
    },
  });

  await sendMail(
    payload.email,
    "OTP Verification",
    `Your OTP for verification is ${otp}. It is valid for 5 minutes.`
  );

  return result;
};

const verifyOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.isVerified) {
    throw new ApiError(404, "User is already verified.");
  }
  if (!user.otpExpires || new Date(user.otpExpires) < new Date()) {
    throw new ApiError(404, "Invalid or expired OTP.");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP.");
  }

  // Mark the user as verified and clear OTP
  const result = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otp: null,
      otpExpires: null,
    },
  });

  return result;
};

const userLoginFromDB = async (payload: ILogin) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found !");
  }
  if (user.isVerified === false) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Verify!");
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new Error("Incorrect password");
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.accessToken as string,
    config.accessTokenExpireDate as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.refreshToken as string,
    config.refreshTokenExpireDate as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

const googleLogin = async (payload: any) => {
  if (!payload.token) {
    throw new ApiError(400, "Token is required!");
  }
  const decodedData = await verifyGoogleToken(payload.token);
  if (!decodedData) {
    throw new ApiError(401, "Invalid token!");
  }

  const { email, name, picture } = decodedData;
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        password: email,
        role: UserRole.user,
        isVerified: true,
        profile: picture || null,
      },
    });
    console.log("New User Created:", user);
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.accessToken as string,
    config.accessTokenExpireDate as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.refreshToken as string,
    config.refreshTokenExpireDate as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, config.refreshToken as string);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your are not authorized !");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Data Not Found !");
  }

  const jwtPayload: JwtPayload = {
    id: userData.id,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.accessToken as string,
    config.accessTokenExpireDate as string
  );

  return {
    accessToken,
  };
};

const changePassword = async (user: ITokenUser, payload: IChangePassword) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Data Not Found !");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password doesn't match !");
  }

  const hashPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "Password Change Successfully ",
  };
};

export const authService = {
  userRegisterIntoDB,
  userLoginFromDB,
  refreshToken,
  changePassword,
  verifyOtp,
  googleLogin,
};
