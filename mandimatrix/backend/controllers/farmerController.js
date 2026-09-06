import mongoose from "mongoose";

import Farmer from "../models/Farmer.js";
import { makeDemoId, memoryStore } from "../services/memoryStore.js";

function dbReady() {
  return mongoose.connection.readyState === 1;
}

export async function registerFarmer(req, res, next) {
  try {
    const { name, phone, location, preferredLanguage = "hi" } = req.body;

    if (!name || !phone || !location?.state || !location?.district || !location?.village) {
      return res.status(400).json({
        message: "name, phone, and location {state, district, village} are required",
      });
    }

    if (dbReady()) {
      const farmer = await Farmer.create({ name, phone, location, preferredLanguage });
      return res.status(201).json({ farmer, source: "mongodb" });
    }

    const farmer = {
      _id: makeDemoId("farmer"),
      name,
      phone,
      location,
      preferredLanguage,
      createdAt: new Date().toISOString(),
    };
    memoryStore.farmers.push(farmer);

    return res.status(201).json({ farmer, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}
