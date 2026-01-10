// backend/routes/bookings.routes.js
import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// 🔎 Отримати зайняті години
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
    console.error("❌ Помилка завантаження часу:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Отримати всі записи всіх барберів на дату (для загального календаря)
router.get("/all", async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Вкажіть дату" });
    }

    const bookings = await Booking.find({
      date: date,
    })
    .populate('barber', 'name color')
    .sort({ time: 1 });

    res.json(bookings);
  } catch (err) {
    console.error("❌ Помилка завантаження записів:", err);
    res.status(500).json({ error: err.message });
  }
});

// ➕ Створити запис
router.post("/", async (req, res) => {
  try {
    console.log("📥 Дані:", req.body);
    const { barberId, startAt, phone, clientName, services } = req.body;

    if (!barberId || !startAt || !phone) {
      return res.status(400).json({ error: "Заповніть всі поля" });
    }

    const dateObj = new Date(startAt);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toTimeString().slice(0, 5);

    const booking = await Booking.create({
      barber: barberId,
      date,
      time,
      phone,
      clientName: clientName || "Клієнт",
      services: services || []
    });

    res.json(booking);
  } catch (err) {
    console.error("❌ Помилка створення запису:", err);
    res.status(500).json({ error: err.message });
  }
});

// Добавьте в backend/routes/bookings.routes.js после POST метода:

/**
 * ❌ Скасувати запис (для барбера/адміна)
 * PUT /api/bookings/:id/cancel
 */
router.put("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        cancelledBy: "barber",
        cancellationReason: reason || "Скасовано барбером"
      },
      { new: true }
    ).populate('barber', 'name color');

    if (!booking) {
      return res.status(404).json({ error: "Запис не знайдено" });
    }

    console.log(`❌ Запис скасовано: ${booking.clientName} (${booking.date} ${booking.time})`);
    res.json(booking);
    
  } catch (err) {
    console.error("❌ Помилка скасування запису:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔄 Відновити запис
 * PUT /api/bookings/:id/restore
 */
router.put("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "active",
        cancelledBy: null,
        cancellationReason: ""
      },
      { new: true }
    ).populate('barber', 'name color');

    if (!booking) {
      return res.status(404).json({ error: "Запис не знайдено" });
    }

    console.log(`✅ Запис відновлено: ${booking.clientName} (${booking.date} ${booking.time})`);
    res.json(booking);
    
  } catch (err) {
    console.error("❌ Помилка відновлення запису:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🗑️ Видалити запис повністю
 * DELETE /api/bookings/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ error: "Запис не знайдено" });
    }

    console.log(`🗑️ Запис видалено: ${booking.clientName} (${booking.date} ${booking.time})`);
    res.json({ message: "Запис видалено успішно" });
    
  } catch (err) {
    console.error("❌ Помилка видалення запису:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;