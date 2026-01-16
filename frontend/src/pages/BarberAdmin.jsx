import { useEffect, useState } from "react";
import "./BarberAdmin.css";

export default function BarberAdmin({ onLogout }) {
  const [barbers, setBarbers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState("");

  // ---------- helpers ----------
  const formatDate = (date) => date.toISOString().split("T")[0];

  const generateTimes = (start, end) => {
    const times = [];
    let [h, m] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    while (h < eh || (h === eh && m < em)) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 60;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }
    return times;
  };

  // ---------- load data ----------
  useEffect(() => {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then(setBarbers);

    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setBookings);
  }, []);

  // ---------- bookings helpers ----------
  const getBooking = (barberId, time) => {
    return bookings.find(
      (b) =>
        b.barberId === barberId &&
        b.date === formatDate(selectedDate) &&
        b.time === time
    );
  };

  // ---------- create booking ----------
  const saveBooking = async () => {
    if (!note.trim()) return alert("Введи заметку");

    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId: selectedBarber._id,
        date: formatDate(selectedDate),
        time: selectedSlot,
        clientName: "—",
        phone: "",
        services: [],
        note,
      }),
    });

    setNote("");
    setSelectedSlot(null);

    const updated = await fetch("/api/bookings").then((r) => r.json());
    setBookings(updated);
  };

  // ---------- UI ----------
  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <h2>Журнал записей</h2>
        <button onClick={onLogout}>Вийти</button>
      </header>

      <div className="admin-controls">
        <select
          value={selectedBarber?._id || ""}
          onChange={(e) =>
            setSelectedBarber(barbers.find((b) => b._id === e.target.value))
          }
        >
          <option value="">Вибери барбера</option>
          {barbers.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={formatDate(selectedDate)}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      {!selectedBarber && <p>Оберіть барбера</p>}

      {selectedBarber && (
        <div className="table">
          {generateTimes(
            selectedBarber.workStart,
            selectedBarber.workEnd
          ).map((time) => {
            const booking = getBooking(selectedBarber._id, time);

            return (
              <div
                key={time}
                className={`cell ${booking ? "busy" : ""}`}
                onClick={() => {
                  if (booking) return;
                  setSelectedSlot(time);
                }}
              >
                <div className="time">{time}</div>
                <div className="content">
                  {booking ? booking.note || "Занято" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className="modal">
          <div className="modal-body">
            <h3>
              {selectedBarber.name} — {selectedSlot}
            </h3>

            <textarea
              placeholder="Заметка (клиент, услуга, комментарий)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />

            <div className="modal-actions">
              <button onClick={saveBooking}>Зберегти</button>
              <button onClick={() => setSelectedSlot(null)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
