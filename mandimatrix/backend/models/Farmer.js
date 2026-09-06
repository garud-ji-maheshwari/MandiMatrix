import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, index: true },
  location: { type: locationSchema, required: true },
  preferredLanguage: {
    type: String,
    enum: ["hi", "mr", "en"],
    default: "hi",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Farmer", farmerSchema);
