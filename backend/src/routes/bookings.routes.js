// backend/routes/bookings.routes.js
import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// 🔎 Отримати зайняті години (ТОЛЬКО АКТИВНІ ЗАПИСИ)
router.get("/", async (req, res) => {
  try {
    const { barberId, date } = req.query;
    if (!barberId || !date) {
      return res.json([]);
    }

    const bookings = await Booking.find({
      barber: barberId,
      date: date,
      status: "active"  // ← ТОЛЬКО АКТИВНІ!
    }).select("time");

    const busyTimes = bookings.map(b => b.time);
    res.json(busyTimes);
  } catch (err) {
    console.error("❌ Помилка завантаження часу:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Отримати всі записи всіх барберів на дату (ТОЛЬКО АКТИВНІ)
router.get("/all", async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Вкажіть дату" });
    }

    const bookings = await Booking.find({
      date: date,
      status: "active"  // ← ТОЛЬКО АКТИВНІ!
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
    console.log("📥 Отримано дані для створення запису:");
    console.log("   Повні дані:", req.body);
    
    const { barberId, startAt, phone, clientName, services } = req.body;

    if (!barberId || !startAt || !phone) {
      return res.status(400).json({ error: "Заповніть всі поля" });
    }

    const dateObj = new Date(startAt);
    
    console.log("🔄 Конвертація часу:");
    console.log("   Отриманий startAt:", startAt);
    console.log("   dateObj (локальний):", dateObj.toString());
    console.log("   dateObj (UTC):", dateObj.toISOString());
    
    // Дата БЕЗ смещения
    const date = dateObj.toISOString().split("T")[0];
    
    // Время СО смещением для Киева (UTC+2)
    const kyivOffset = 2 * 60 * 60 * 1000;
    const kyivDate = new Date(dateObj.getTime() + kyivOffset);
    const time = kyivDate.toTimeString().slice(0, 5);
    
    console.log("📅 Результат конвертації:");
    console.log("   Дата (без зсуву):", date);
    console.log("   Час (UTC+2):", time);

    const booking = await Booking.create({
      barber: barberId,
      date,
      time,
      phone,
      clientName: clientName || "Клієнт",
      services: services || [],
      status: "active",  // ← ЗАВЖДИ АКТИВНИЙ ПРИ СОЗДАНИИ
      cancelledBy: null,
      cancellationReason: ""
    });

    console.log(`✅ Запис успішно створено:`);
    console.log(`   ID: ${booking._id}`);
    console.log(`   Барбер: ${barberId}`);
    console.log(`   Дата: ${date}`);
    console.log(`   Час: ${time}`);
    console.log(`   Клієнт: ${clientName || "Клієнт"}`);
    console.log(`   Телефон: ${phone}`);
    
    res.json(booking);
  } catch (err) {
    console.error("❌ Помилка створення запису:");
    console.error("   Повідомлення:", err.message);
    console.error("   Стек:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ❌ Скасувати запис (для барбера/адміна)
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

// 🗑️ Видалити запис повністю (НАВСЕГДИ)
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