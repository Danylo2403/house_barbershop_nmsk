import cron from "node-cron";
import Booking from "../models/Booking.js";

export function startNotifyCron() {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Перевірка записів на завтра...");

    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      date: { $gte: start, $lte: end }
    });

    bookings.forEach(b => {
      console.log(
        `🔔 Нагадування клієнту ${b.name}, барбер: ${b.barber}`
      );
    });
  });
}
