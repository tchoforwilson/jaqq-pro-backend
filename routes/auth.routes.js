import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authController.protect);
router.post(
  "/register-phone",
  authController.checkPhoneNumber,
  authController.registerPhone
);
router.post(
  "/resend-sms-code",
  authController.checkPhoneNumber,
  authController.resendSMSCode
);
router.post("/verify-sms-code", authController.verifySMSCode);
router.patch(
  "/update-my-phone",
  authController.checkPhoneNumber,
  authController.updatePhone
);
router.patch("/update-my-password", authController.updatePassword);

export default router;
