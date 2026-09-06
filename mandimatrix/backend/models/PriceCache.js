import mongoose from "mongoose";

const priceCacheSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true, index: true },
  crop: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  prices: { type: [mongoose.Schema.Types.Mixed], default: [] },
  history: { type: [mongoose.Schema.Types.Mixed], default: [] },
  source: { type: String, default: "mock-fallback" },
  refreshedOn: { type: Date, default: Date.now },
});

export default mongoose.model("PriceCache", priceCacheSchema);
