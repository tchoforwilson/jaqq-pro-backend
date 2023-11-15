import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authController.protect);

router.patch("/update-my-password", authController.updatePassword);
router.patch("/update-my-phone", authController.updatePhone);
router.post("/verify-sms-code", authController.verifySMSCode);
router.get("/resend-sms-code", authController.resendSMSCode);

export default router;
