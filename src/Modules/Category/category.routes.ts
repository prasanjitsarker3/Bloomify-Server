import express from "express";
import { categoryController } from "./categoryController";
import { fileUploader } from "../../Helpers/fileUploader";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();
router.post(
  "/created",
  auth(UserRole.admin),
  categoryController.createdCategory
);
router.get("", categoryController.allCategory);
router.patch("/:id", auth(UserRole.admin), categoryController.deletedCategory);
router.patch(
  "/update/:toggleId",
  auth(UserRole.admin),
  categoryController.categoryToggle
);

export const categoryRoutes = router;
