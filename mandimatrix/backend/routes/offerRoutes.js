import express from "express";

import { acceptOffer, createOffer, listOffers } from "../controllers/offerController.js";

const router = express.Router();

router.post("/", createOffer);
router.get("/", listOffers);
router.patch("/:id/accept", acceptOffer);

export default router;
