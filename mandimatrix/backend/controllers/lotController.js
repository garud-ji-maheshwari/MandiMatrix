import mongoose from "mongoose";

import Buyer from "../models/Buyer.js";
import Lot from "../models/Lot.js";
import { makeDemoId, memoryStore } from "../services/memoryStore.js";

function dbReady() {
  return mongoose.connection.readyState === 1;
}

function defaultAuctionEnd() {
  const end = new Date();
  end.setDate(end.getDate() + 2);
  return end;
}

function scoreBuyerForLot(buyer, lot) {
  const locationScore = buyer.location
    ?.toLowerCase()
    .includes(lot.location?.toLowerCase().split(",")[0] || "")
    ? 2
    : 0;
  const verifiedScore = buyer.verified ? 1 : 0;
  const businessScore = ["wholesaler", "processor", "exporter"].includes(
    buyer.businessType?.toLowerCase(),
  )
    ? 1
    : 0;
  return locationScore + verifiedScore + businessScore;
}

export async function createLot(req, res, next) {
  try {
    const {
      farmerId,
      cropType,
      quantity,
      qualityGrade,
      location,
      auctionWindowEnd = defaultAuctionEnd(),
    } = req.body;

    if (!farmerId || !cropType || !quantity || !qualityGrade || !location) {
      return res.status(400).json({
        message: "farmerId, cropType, quantity, qualityGrade, and location are required",
      });
    }

    if (dbReady()) {
      const lot = await Lot.create({
        farmerId,
        cropType,
        quantity,
        qualityGrade,
        location,
        auctionWindowEnd,
      });
      return res.status(201).json({ lot, source: "mongodb" });
    }

    const lot = {
      _id: makeDemoId("lot"),
      farmerId,
      cropType,
      quantity: Number(quantity),
      qualityGrade,
      location,
      listedAt: new Date().toISOString(),
      auctionWindowEnd,
      status: "listed",
      acceptedOfferId: null,
      paymentStatus: "payment_pending",
    };
    memoryStore.lots.push(lot);
    return res.status(201).json({ lot, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}

export async function listLots(req, res, next) {
  try {
    if (dbReady()) {
      const lots = await Lot.find().sort({ listedAt: -1 }).lean();
      return res.json({ lots, source: "mongodb" });
    }

    return res.json({
      lots: [...memoryStore.lots].sort(
        (a, b) => new Date(b.listedAt) - new Date(a.listedAt),
      ),
      source: "memory-demo",
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatchingBuyers(req, res, next) {
  try {
    const { id } = req.params;

    if (dbReady()) {
      const lot = await Lot.findById(id).lean();
      if (!lot) return res.status(404).json({ message: "Lot not found" });
      const buyers = await Buyer.find().lean();
      const matchingBuyers = buyers
        .map((buyer) => ({ ...buyer, matchScore: scoreBuyerForLot(buyer, lot) }))
        .filter((buyer) => buyer.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
      return res.json({ lotId: id, matchingBuyers, source: "mongodb" });
    }

    const lot = memoryStore.lots.find((item) => item._id === id);
    if (!lot) return res.status(404).json({ message: "Lot not found" });
    const matchingBuyers = memoryStore.buyers
      .map((buyer) => ({ ...buyer, matchScore: scoreBuyerForLot(buyer, lot) }))
      .filter((buyer) => buyer.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
    return res.json({ lotId: id, matchingBuyers, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}

export async function togglePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus = "payment_received" } = req.body;

    if (dbReady()) {
      const lot = await Lot.findByIdAndUpdate(
        id,
        { paymentStatus },
        { new: true, runValidators: true },
      );
      if (!lot) return res.status(404).json({ message: "Lot not found" });
      return res.json({ lot, source: "mongodb" });
    }

    const lot = memoryStore.lots.find((item) => item._id === id);
    if (!lot) return res.status(404).json({ message: "Lot not found" });
    lot.paymentStatus = paymentStatus;
    return res.json({ lot, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}
