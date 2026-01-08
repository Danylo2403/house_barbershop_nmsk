import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import "./BookingSheet.css";

const TIMES = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00"
];

export default function BookingSheet({ open, onClose, barber }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [busyTimes, setBusyTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👉 автоматично сьогодні
  useEffect(() => {
    if (open && !date) {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [open, date]);

  // 👉 завантажити зайняті слоти
  useEffect(() => {
    if (!open || !barber || !date) return;
    fetch(`http://localhost:5000/api/bookings?barberId=${barber._id}&date=${date}`)
      .then(res => res.json())
      .then(data => setBusyTimes(data));
  }, [open, barber, date]);

  if (!open || !barber) return null;

  const isValid = date && time && phone.trim().length >= 10;

  const submit = async () => {
    setLoading(true);
    try {
      const startAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: barber._id,
          startAt,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Запис створено ✅");
      onClose();
      setTime("");
      setPhone("");
    } catch (e) {
      alert("Помилка: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="sheet-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="sheet"
          onClick={e => e.stopPropagation()}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
        >
          <div className="sheet-handle" />
          <h2>Запис до {barber.name}</h2>

          <BookingCalendar value={date} onChange={setDate} />

          <div className="times">
            {TIMES.map(t => {
              const busy = busyTimes.includes(t);
              return (
                <button
                  key={t}
                  disabled={busy}
                  className={`time ${time === t ? "active" : ""} ${busy ? "busy" : ""}`}
                  onClick={() => !busy && setTime(t)}
                >
                  {busy ? `${t} ❌` : t}
                </button>
              );
            })}
          </div>

          <input
            className="phone"
            placeholder="0..."
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <button
            className="confirm"
            disabled={!isValid || loading}
            onClick={submit}
          >
            {loading ? "Відправка..." : "Підтвердити запис"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}