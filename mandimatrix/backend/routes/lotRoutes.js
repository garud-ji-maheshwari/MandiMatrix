import express from "express";

import {
  createLot,
  getMatchingBuyers,
  listLots,
  togglePaymentStatus,
} from "../controllers/lotController.js";

const router = express.Router();

router.post("/", createLot);
router.get("/", listLots);
router.get("/:id/matching-buyers", getMatchingBuyers);
router.patch("/:id/payment-status", togglePaymentStatus);

export default router;
