import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import farmerRoutes from "./routes/farmerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import lotRoutes from "./routes/lotRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mandimatrix";

mongoose.set("bufferCommands", false);

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Continuing with demo fallbacks where available.");
  });

app.get("/", (req, res) => {
  res.json({
    name: "MandiMatrix API",
    status: "running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/prices", priceRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
