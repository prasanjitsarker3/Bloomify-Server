import express from "express";
import { userController } from "./userController";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get("", userController.getAllUser);
router.get(
  "/me",
  auth(UserRole.admin, UserRole.user),
  userController.myProfile
);
router.patch("/:userId", auth(UserRole.admin), userController.profileUpdate);
router.patch(
  "/delete/:deleteId",
  auth(UserRole.admin, UserRole.user),
  userController.deleteUser
);

export const userRoutes = router;
