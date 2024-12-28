"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bannerController_1 = require("./bannerController");
const fileUploader_1 = require("../../Helpers/fileUploader");
const auth_1 = __importDefault(require("../../Middleware/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/create", (0, auth_1.default)(client_1.UserRole.admin), fileUploader_1.fileUploader.upload.single("file"), bannerController_1.bannerController.createBanner);
router.get("", bannerController_1.bannerController.getAllBanner);
router.delete("/:deleteId", (0, auth_1.default)(client_1.UserRole.admin), bannerController_1.bannerController.deleteBanner);
exports.bannerRoutes = router;
