import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something Went Wrong!";
  let error = err;

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation Error";
    error = err.message;
  }
  // Handle Prisma known request errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002" && err.meta) {
      // Check if `err.meta` exists
      const errorFind = `${err.meta.modelName} table, Target Fields: ${err.meta.target}`;
      message = `Unique constraint failed on the ${errorFind}`;
      error = err.meta;
    } else {
      message = err.message;
      error = err;
    }
  }
  // Handle Prisma unknown request errors
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown Prisma Request Error";
    error = err.message;
  }
  // Handle Prisma connection errors
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    message = "Prisma Rust Panic Error";
    error = err.message;
  }
  // Handle Prisma timeout errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma Initialization Error";
    error = err.message;
  }
  // Handle other Prisma errors
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown Prisma Error";
    error = err.message;
  }

  // Send response with appropriate error message and status
  res.status(statusCode).json({
    statusCode,
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
