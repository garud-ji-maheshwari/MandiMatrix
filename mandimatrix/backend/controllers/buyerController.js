import mongoose from "mongoose";

import Buyer from "../models/Buyer.js";
import { makeDemoId, memoryStore } from "../services/memoryStore.js";

function dbReady() {
  return mongoose.connection.readyState === 1;
}

export async function registerBuyer(req, res, next) {
  try {
    const { name, phone, businessType, verified = false, location } = req.body;

    if (!name || !phone || !businessType || !location) {
      return res.status(400).json({
        message: "name, phone, businessType, and location are required",
      });
    }

    if (dbReady()) {
      const buyer = await Buyer.create({ name, phone, businessType, verified, location });
      return res.status(201).json({ buyer, source: "mongodb" });
    }

    const buyer = {
      _id: makeDemoId("buyer"),
      name,
      phone,
      businessType,
      verified,
      location,
      createdAt: new Date().toISOString(),
    };
    memoryStore.buyers.push(buyer);
    return res.status(201).json({ buyer, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}
