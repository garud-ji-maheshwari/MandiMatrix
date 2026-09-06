import mongoose from "mongoose";

import Dispute from "../models/Dispute.js";
import { makeDemoId, memoryStore } from "../services/memoryStore.js";

function dbReady() {
  return mongoose.connection.readyState === 1;
}

export async function createDispute(req, res, next) {
  try {
    const { lotId, raisedBy, category, description } = req.body;

    if (!lotId || !raisedBy || !category || !description) {
      return res.status(400).json({
        message: "lotId, raisedBy, category, and description are required",
      });
    }

    if (dbReady()) {
      const dispute = await Dispute.create({ lotId, raisedBy, category, description });
      return res.status(201).json({ dispute, source: "mongodb" });
    }

    const dispute = {
      _id: makeDemoId("dispute"),
      lotId,
      raisedBy,
      category,
      description,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    memoryStore.disputes.push(dispute);
    return res.status(201).json({ dispute, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}

export async function listDisputes(req, res, next) {
  try {
    if (dbReady()) {
      const disputes = await Dispute.find().sort({ createdAt: -1 }).lean();
      return res.json({ disputes, source: "mongodb" });
    }

    return res.json({
      disputes: [...memoryStore.disputes].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
      source: "memory-demo",
    });
  } catch (error) {
    next(error);
  }
}
