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

/* ===================== */
/* FIX __dirname для ES  */
/* ===================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== */
/* Express app           */
/* ===================== */
const app = express();

app.use(cors());
app.use(express.json());

/* ===================== */
/* 🔥 React build folder */
/* ===================== */
const frontendPath = path.join(__dirname, "../../frontend/dist");

/* 🔥 Serve React static files */
app.use(express.static(frontendPath));

/* 🔥 Serve barber photos from frontend/public/images */
app.use(
  "/images",
  express.static(path.join(__dirname, "../../frontend/public/images"))
);

/* ===================== */
/* API Routes            */
/* ===================== */
app.use("/api/barbers", barbersRoutes);
app.use("/api/bookings", bookingsRoutes);

/* ===================== */
/* 🔥 React Router fix   */
/* ===================== */
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ===================== */
/* MongoDB               */
/* ===================== */
mongoose.set("bufferCommands", false);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    startCrons();
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
