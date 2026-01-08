import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

/**
 * 🔎 Отримати зайняті години
 * GET /api/bookings?barberId=...&date=YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  try {
    const { barberId, date } = req.query;
    if (!barberId || !date) {
      return res.json([]);
    }

    const bookings = await Booking.find({
      barber: barberId,
      date: date,
    }).select("time");

    const busyTimes = bookings.map(b => b.time);
    res.json(busyTimes);
  } catch (err) {
    console.error("❌ Busy slots error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔎 Отримати всі записи барбера на конкретну дату (ДЛЯ КАЛЕНДАРЯ)
 * GET /api/bookings/barber/:barberId?date=YYYY-MM-DD
 */
router.get("/barber/:barberId", async (req, res) => {
  try {
    const { barberId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const bookings = await Booking.find({
      barber: barberId,
      date: date,
    }).sort({ time: 1 });

    res.json(bookings);
  } catch (err) {
    console.error("❌ Get barber bookings error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔎 Отримати всі записи барбера (всі дати)
 * GET /api/bookings/barber/:barberId/all
 */
router.get("/barber/:barberId/all", async (req, res) => {
  try {
    const { barberId } = req.params;
    
    const bookings = await Booking.find({
      barber: barberId,
    }).sort({ date: -1, time: 1 });

    res.json(bookings);
  } catch (err) {
    console.error("❌ Get all barber bookings error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ➕ Створити запис
 * POST /api/bookings
 */
router.post("/", async (req, res) => {
  try {
    console.log("📥 DATA:", req.body);
    const { barberId, startAt, phone } = req.body;

    if (!barberId || !startAt || !phone) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const dateObj = new Date(startAt);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toTimeString().slice(0, 5);

    const booking = await Booking.create({
      barber: barberId,
      date,
      time,
      phone,
    });

    res.json(booking);
  } catch (err) {
    console.error("❌ Create booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;