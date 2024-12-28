import { metaDataRoutes } from "./../Modules/MetaData/meta.routes";
import express from "express";
import { userRoutes } from "../Modules/User/user.routes";
import { authRoutes } from "../Modules/Auth/auth.routes";
import { categoryRoutes } from "../Modules/Category/category.routes";
import { productRoutes } from "../Modules/Product/product.routes";
import { orderRoutes } from "../Modules/Order/order.routes";
import { bannerRoutes } from "../Modules/Banner/banner.routes";

const router = express.Router();

const moduleRoute = [
  {
    path: "/users",
    element: userRoutes,
  },
  {
    path: "/auth",
    element: authRoutes,
  },
  {
    path: "/banner",
    element: bannerRoutes,
  },
  {
    path: "/category",
    element: categoryRoutes,
  },
  {
    path: "/product",
    element: productRoutes,
  },
  {
    path: "/order",
    element: orderRoutes,
  },
  {
    path: "/meta",
    element: metaDataRoutes,
  },
];

moduleRoute.forEach((route) => router.use(route.path, route.element));
export default router;
