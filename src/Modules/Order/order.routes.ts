import express from "express";
import { orderController } from "./orderController";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get(
  "",
  auth(UserRole.admin, UserRole.user),
  orderController.getAllOrders
);
router.get(
  "/adminOrder",
  auth(UserRole.admin, UserRole.user),
  orderController.getAllOrdersForAdmin
);
router.get(
  "/confirmOrder",
  auth(UserRole.admin, UserRole.user),
  orderController.getConfirmOrders
);
router.get(
  "/deliveryOrder",
  auth(UserRole.admin, UserRole.user),
  orderController.getDeliveryOrders
);
router.get(
  "/returnOrder",
  auth(UserRole.admin, UserRole.user),
  orderController.getAllReturnOrder
);
router.get(
  "/:productId",
  auth(UserRole.admin, UserRole.user),
  orderController.getSingleOrder
);
router.post("/create", orderController.createOrder);
router.post("/create-check-sessions", orderController.onlineOrder);

router.patch(
  "/updateDiscount",
  auth(UserRole.user, UserRole.admin),
  orderController.getDeliveryAndPrice
);
router.patch(
  "/:orderId",
  auth(UserRole.admin, UserRole.user),
  orderController.updateOrderStatus
);
router.patch(
  "/pdf/:pdfId",
  auth(UserRole.admin, UserRole.user),
  orderController.pdfDownload
);
router.delete(
  "/:orderProductId",
  auth(UserRole.admin, UserRole.user),
  orderController.deleteOrder
);

export const orderRoutes = router;
