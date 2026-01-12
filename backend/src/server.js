import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { startCrons } from "./cron/index.js";
import barbersRoutes from "./routes/barbers.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";

dotenv.config();

/* 🔧 FIX __dirname for ES modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 🔥 Create app */
const app = express();

/* 🔥 Middlewares */
app.use(cors());
app.use(express.json());

/* 🔥 Static barber images */
app.use(
  "/images",
  express.static(path.join(__dirname, "../../frontend/public/images"))
);

/* 🔥 API routes */
app.use("/api/barbers", barbersRoutes);
app.use("/api/bookings", bookingsRoutes);

/* 🔥 React build path */
const frontendPath = path.join(__dirname, "../../frontend/dist");

/* 🔥 Serve React */
app.use(express.static(frontendPath));

/* 🔥 SPA fallback */
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ❗ Disable mongoose buffering */
mongoose.set("bufferCommands", false);

/* 🔥 Start server */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    startCrons();
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
