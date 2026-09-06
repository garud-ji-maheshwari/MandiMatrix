import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true,
  },
  cropType: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  qualityGrade: { type: String, enum: ["A", "B", "C"], required: true },
  location: { type: String, required: true, trim: true },
  listedAt: { type: Date, default: Date.now },
  auctionWindowEnd: { type: Date, required: true },
  status: {
    type: String,
    enum: ["listed", "offers_received", "accepted", "completed"],
    default: "listed",
  },
  acceptedOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ["payment_pending", "payment_received"],
    default: "payment_pending",
  },
});

export default mongoose.model("Lot", lotSchema);
