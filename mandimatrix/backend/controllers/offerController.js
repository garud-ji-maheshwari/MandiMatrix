import mongoose from "mongoose";

import Lot from "../models/Lot.js";
import Offer from "../models/Offer.js";
import { makeDemoId, memoryStore } from "../services/memoryStore.js";

function dbReady() {
  return mongoose.connection.readyState === 1;
}

export async function createOffer(req, res, next) {
  try {
    const { lotId, buyerId, pricePerQuintal, message = "" } = req.body;

    if (!lotId || !buyerId || !pricePerQuintal) {
      return res.status(400).json({
        message: "lotId, buyerId, and pricePerQuintal are required",
      });
    }

    if (dbReady()) {
      const offer = await Offer.create({ lotId, buyerId, pricePerQuintal, message });
      await Lot.findByIdAndUpdate(lotId, { status: "offers_received" });
      return res.status(201).json({ offer, source: "mongodb" });
    }

    const offer = {
      _id: makeDemoId("offer"),
      lotId,
      buyerId,
      pricePerQuintal: Number(pricePerQuintal),
      message,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    memoryStore.offers.push(offer);
    const lot = memoryStore.lots.find((item) => item._id === lotId);
    if (lot) lot.status = "offers_received";
    return res.status(201).json({ offer, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}

export async function listOffers(req, res, next) {
  try {
    const { lotId } = req.query;

    if (dbReady()) {
      const query = lotId ? { lotId } : {};
      const offers = await Offer.find(query).sort({ submittedAt: -1 }).lean();
      return res.json({ offers, source: "mongodb" });
    }

    const offers = memoryStore.offers
      .filter((offer) => !lotId || offer.lotId === lotId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return res.json({ offers, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}

export async function acceptOffer(req, res, next) {
  try {
    const { id } = req.params;

    if (dbReady()) {
      const offer = await Offer.findByIdAndUpdate(
        id,
        { status: "accepted" },
        { new: true },
      );
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      await Offer.updateMany(
        { lotId: offer.lotId, _id: { $ne: offer._id } },
        { status: "rejected" },
      );
      const lot = await Lot.findByIdAndUpdate(
        offer.lotId,
        { status: "accepted", acceptedOfferId: offer._id },
        { new: true },
      );
      return res.json({ offer, lot, source: "mongodb" });
    }

    const offer = memoryStore.offers.find((item) => item._id === id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    offer.status = "accepted";
    memoryStore.offers.forEach((item) => {
      if (item.lotId === offer.lotId && item._id !== offer._id) {
        item.status = "rejected";
      }
    });
    const lot = memoryStore.lots.find((item) => item._id === offer.lotId);
    if (lot) {
      lot.status = "accepted";
      lot.acceptedOfferId = offer._id;
    }
    return res.json({ offer, lot, source: "memory-demo" });
  } catch (error) {
    next(error);
  }
}
