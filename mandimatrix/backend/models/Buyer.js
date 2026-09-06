import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, index: true },
  businessType: { type: String, required: true, trim: true },
  verified: { type: Boolean, default: false },
  location: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Buyer", buyerSchema);
