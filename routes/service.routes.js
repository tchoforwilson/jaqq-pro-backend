import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import serviceController from "../controllers/service.controller.js";

const router = Router();

router.use(authController.protect, authController.restrictToVerified);

router
  .route("/")
  .get(serviceController.getAllServices)
  .post(serviceController.createService);

router
  .route("/:id")
  .patch(serviceController.updateService)
  .get(serviceController.getService)
  .delete(serviceController.deleteService);

export default router;
