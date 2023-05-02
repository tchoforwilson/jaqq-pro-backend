import { Router } from "express";
import pricingController from "../controllers/pricingController.js";
import providerAuthController from "../controllers/authentication/providerAuthController.js";

const router = Router({ mergeParams: true });

router.use(providerAuthController.protect);

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
