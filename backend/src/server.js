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

/* ✅ FIX __dirname для ES modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ✅ СНАЧАЛА создаём app */
const app = express();

/* ✅ MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ✅ СТАТИКА ДЛЯ ФОТО БАРБЕРОВ */
app.use(
  "/images",
  express.static(path.join(__dirname, "../../frontend/public/images"))
);

/* ✅ ROUTES */
app.use("/api/barbers", barbersRoutes);
app.use("/api/bookings", bookingsRoutes);

/* ❗ НЕ буферизуем запросы без БД */
mongoose.set("bufferCommands", false);

/* ✅ START SERVER */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    startCrons();
    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });