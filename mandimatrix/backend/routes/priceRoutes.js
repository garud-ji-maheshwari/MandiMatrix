import express from "express";

import { listPrices, listPriceTrend } from "../controllers/priceController.js";

const router = express.Router();

router.get("/", listPrices);
router.get("/trend", listPriceTrend);

export default router;
