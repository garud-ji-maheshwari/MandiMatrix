import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lot",
    required: true,
  },
  raisedBy: { type: String, enum: ["farmer", "buyer"], required: true },
  category: {
    type: String,
    enum: ["payment", "quality", "other"],
    required: true,
  },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Dispute", disputeSchema);
