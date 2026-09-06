import express from "express";

import { registerFarmer } from "../controllers/farmerController.js";

const router = express.Router();

router.post("/register", registerFarmer);

export default router;
