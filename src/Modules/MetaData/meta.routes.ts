import express from "express";
import { metaController } from "./metaController";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/adminMeta",
  auth(UserRole.admin),
  metaController.adminDashboardMetaData
);
router.get(
  "/moderatorMeta",
  auth(UserRole.admin, UserRole.user),
  metaController.moderatorDashboardData
);
router.get("/monthlyMetaData", metaController.getDashboardMonthlyData);

export const metaDataRoutes = router;
