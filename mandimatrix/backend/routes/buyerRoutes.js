import express from "express";

import { registerBuyer } from "../controllers/buyerController.js";

const router = express.Router();

router.post("/register", registerBuyer);

export default router;
