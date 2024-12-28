"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaDataRoutes = void 0;
const express_1 = __importDefault(require("express"));
const metaController_1 = require("./metaController");
const auth_1 = __importDefault(require("../../Middleware/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/adminMeta", (0, auth_1.default)(client_1.UserRole.admin), metaController_1.metaController.adminDashboardMetaData);
router.get("/moderatorMeta", (0, auth_1.default)(client_1.UserRole.admin, client_1.UserRole.user), metaController_1.metaController.moderatorDashboardData);
router.get("/monthlyMetaData", metaController_1.metaController.getDashboardMonthlyData);
exports.metaDataRoutes = router;
