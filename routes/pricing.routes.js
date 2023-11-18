import { Router } from "express";
import pricingController from "../controllers/pricing.controller.js";
import authController from "../controllers/auth.controller.js";

const router = Router({ mergeParams: true });

router.use(authController.protect);

router.get("/count", pricingController.countPricing);

router
  .route("/")
  .get(pricingController.getAllPricings)
  .post(pricingController.setProviderTaskIds, pricingController.createPricing);

router
  .route("/:id")
  .get(pricingController.getPricing)
  .patch(pricingController.updatePricing)
  .delete(pricingController.deletePricing);

export default router;
