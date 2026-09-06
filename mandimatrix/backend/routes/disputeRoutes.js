import express from "express";

import { createDispute, listDisputes } from "../controllers/disputeController.js";

const router = express.Router();

router.post("/", createDispute);
router.get("/", listDisputes);

export default router;
