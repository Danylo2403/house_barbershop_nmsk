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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

/* 🔥 React build folder */
const frontendPath = path.join(__dirname, "../../frontend/dist");

/* 🔥 Статика React */
app.use(express.static(frontendPath));

/* 🔥 Фото барберов */
app.use("/images", express.static(path.join(frontendPath, "images")));

/* API */
app.use("/api/barbers", barbersRoutes);
app.use("/api/bookings", bookingsRoutes);

/* 🔥 React router support */
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* Mongo */
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
