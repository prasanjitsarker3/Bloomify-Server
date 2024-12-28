import express from "express";
import validationRequest from "../../Middleware/validationRequest";
import { userLoginSchema, userRegistrationSchema } from "./authValidation";
import { authController } from "./authController";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/register", authController.userRegister);
router.post("/verify-otp", authController.verifyUserOtp);
router.post(
  "/login",
  // validationRequest(userLoginSchema),
  authController.userLogin
);
router.post("/google", authController.googleLogin);
router.post("/refreshToken", authController.refreshToken);
router.post("/change-password", authController.changePassword);

export const authRoutes = router;
