"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const userController_1 = require("./userController");
const auth_1 = __importDefault(require("../../Middleware/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("", userController_1.userController.getAllUser);
router.get("/me", (0, auth_1.default)(client_1.UserRole.admin, client_1.UserRole.user), userController_1.userController.myProfile);
router.patch("/:userId", (0, auth_1.default)(client_1.UserRole.admin), userController_1.userController.profileUpdate);
router.patch("/delete/:deleteId", (0, auth_1.default)(client_1.UserRole.admin, client_1.UserRole.user), userController_1.userController.deleteUser);
exports.userRoutes = router;
