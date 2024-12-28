"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = (to, subject, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
            throw new Error("Environment variables EMAIL or EMAIL_PASSWORD are missing.");
        }
        // Create transporter
        const transporter = nodemailer_1.default.createTransport({
            secure: true,
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const htmlContent = `
    <div style="background-color: #028355; color: #FFFFFF; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
     <h1 style="color: white;">OTP Verification</h1>
     <p style="color: white;">Your OTP for verification is <strong>${text}</strong></p>
     <p style="color: white;">It is valid for 5 minutes.</p>
    </div> `;
        // Define mail options
        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            html: htmlContent,
        };
        console.log("Mail Options:", mailOptions);
        // Send mail
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        return info;
    }
    catch (error) {
        // Add detailed error logging
        console.error("Error occurred while sending email:", error);
        //@ts-ignore
        if (error.response) {
            //@ts-ignore
            console.error("SMTP Response:", error.response);
        }
        throw new Error("Failed to send email.");
    }
});
exports.default = sendMail;
