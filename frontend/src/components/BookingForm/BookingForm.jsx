import { useState } from "react";
import { createBooking } from "../../services/api";
import BookingCalendar from "../BookingSheet/BookingCalendar";
import "./BookingForm.css";

export default function BookingForm({ barber, onSuccess }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");

  const submit = async () => {
    console.log("CLICK", { date, time, phone });

    if (!date || !time || !phone) {
      alert("Заповніть всі поля");
      return;
    }

    await createBooking({
      barberId: barber._id,
      date,
      time,
      phone,
    });

    alert("Запис підтверджено ✅");
    onSuccess();
  };

  return (
    <div className="booking-form">
      <h3>Запис до {barber.name}</h3>

      <BookingCalendar value={date} onChange={setDate} />

      <select value={time} onChange={e => setTime(e.target.value)}>
        <option value="">Оберіть час</option>
        <option value="10:00">10:00</option>
        <option value="11:00">11:00</option>
        <option value="12:00">12:00</option>
        <option value="13:00">13:00</option>
      </select>

      <input
        placeholder="Телефон"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <button className="confirm-btn" onClick={submit}>
        Підтвердити запис
      </button>
    </div>
  );
}
