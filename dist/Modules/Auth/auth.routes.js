"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("./authController");
const router = express_1.default.Router();
router.post("/register", authController_1.authController.userRegister);
router.post("/verify-otp", authController_1.authController.verifyUserOtp);
router.post("/login", 
// validationRequest(userLoginSchema),
authController_1.authController.userLogin);
router.post("/google", authController_1.authController.googleLogin);
router.post("/refreshToken", authController_1.authController.refreshToken);
router.post("/change-password", authController_1.authController.changePassword);
exports.authRoutes = router;
