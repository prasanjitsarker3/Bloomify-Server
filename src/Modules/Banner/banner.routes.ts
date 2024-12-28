import express from "express";
import { bannerController } from "./bannerController";
import { fileUploader } from "../../Helpers/fileUploader";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.admin),
  fileUploader.upload.single("file"),
  bannerController.createBanner
);

router.get("", bannerController.getAllBanner);
router.delete(
  "/:deleteId",
  auth(UserRole.admin),
  bannerController.deleteBanner
);

export const bannerRoutes = router;
