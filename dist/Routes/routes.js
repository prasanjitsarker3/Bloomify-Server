"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meta_routes_1 = require("./../Modules/MetaData/meta.routes");
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../Modules/User/user.routes");
const auth_routes_1 = require("../Modules/Auth/auth.routes");
const category_routes_1 = require("../Modules/Category/category.routes");
const product_routes_1 = require("../Modules/Product/product.routes");
const order_routes_1 = require("../Modules/Order/order.routes");
const banner_routes_1 = require("../Modules/Banner/banner.routes");
const router = express_1.default.Router();
const moduleRoute = [
    {
        path: "/users",
        element: user_routes_1.userRoutes,
    },
    {
        path: "/auth",
        element: auth_routes_1.authRoutes,
    },
    {
        path: "/banner",
        element: banner_routes_1.bannerRoutes,
    },
    {
        path: "/category",
        element: category_routes_1.categoryRoutes,
    },
    {
        path: "/product",
        element: product_routes_1.productRoutes,
    },
    {
        path: "/order",
        element: order_routes_1.orderRoutes,
    },
    {
        path: "/meta",
        element: meta_routes_1.metaDataRoutes,
    },
];
moduleRoute.forEach((route) => router.use(route.path, route.element));
exports.default = router;
