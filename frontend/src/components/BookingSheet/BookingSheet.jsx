import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import "./BookingSheet.css";

const TIMES = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00"
];

// Список услуг с ценами
const SERVICES = [
  { id: "haircut", name: "Стрижка", price: 800 },
  { id: "haircut_beard", name: "Стрижка + борода", price: 1000 },
  { id: "machine_haircut", name: "Стрижка під машинку насадками", price: 650 },
  { id: "machine_haircut_beard", name: "Стрижка під машинку + борода", price: 850 },
  { id: "long_haircut", name: "Подовжена стрижка", price: 800 },
  { id: "father_son", name: "Батько + син (до 10 років)", price: 1250 },
  { id: "beard_design", name: "+ оформлення бороди", price: 300 },
  { id: "father_two_sons", name: "Батько + син + син (до 10 років)", price: 1500 },
  { id: "beard_grooming", name: "Оформлення бороди", price: 700 },
  { id: "haircut_shave", name: "Стрижка + гоління обличчя", price: 1000 },
  { id: "head_shave_beard", name: "Гоління голови + грумінг бороди", price: 1000 },
  { id: "royal_shave", name: "Королівське гоління голови + бороди", price: 1000 },
   // KIDS
  { id: "kids_under_10", name: "Дитяча стрижка до 10 років", price: 550 },
  { id: "teen_10_14", name: "Підліткова стрижка (10-14 років)", price: 700 },
  // STYLING
  { id: "hair_styling", name: "Укладання волосся", price: 300 },
  { id: "hair_trim", name: "Окантовка волосся", price: 350 },
  { id: "wax_one_zone", name: "Воск однієї зони", price: 100 },
  { id: "complex_styling", name: "Комплекс", price: 400 },
  // CAMOUFLAGE
  { id: "head_camouflage", name: "Камуфляж голови", price: 700 },
  { id: "beard_camouflage", name: "Камуфляж бороди", price: 500 },
  { id: "head_peeling", name: "Пілінг голови", price: 500 }
];

export default function BookingSheet({ open, onClose, barber }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [busyTimes, setBusyTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // 👉 автоматично сьогодні
  useEffect(() => {
    if (open && !date) {
      setDate(new Date().toISOString().split("T")[0]);
      setClientName("");
      setSelectedServices([]);
    }
  }, [open, date]);

  // 👉 завантажити зайняті слоти
  useEffect(() => {
    if (!open || !barber || !date) return;
    fetch(`${import.meta.env.VITE_API_URL}/bookings?barberId=${barber._id}&date=${date}`)
      .then(res => res.json())
      .then(data => setBusyTimes(data));
  }, [open, barber, date]);

  if (!open || !barber) return null;

  const isValid = date && time && phone.trim().length >= 10 && clientName.trim().length > 0;

  // Расчет общей суммы
  const totalPrice = selectedServices.reduce((sum, serviceId) => {
    const service = SERVICES.find(s => s.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const submit = async () => {
    setLoading(true);
    try {
      const startAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: barber._id,
          startAt,
          phone: phone.trim(),
          clientName: clientName.trim(),
          services: selectedServices
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Запис створено ✅");
      onClose();
      setTime("");
      setPhone("");
      setClientName("");
      setSelectedServices([]);
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

          <div className="form-section">
            <input
              className="name"
              placeholder="Ваше ім'я"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
            />

            <input
              className="phone"
              placeholder="Номер телефону"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Кнопка выбора услуг */}
          <div className="services-section">
            <div className="services-header">
              <span>Послуги:</span>
              <button 
                className="choose-services-btn"
                onClick={() => setShowServiceModal(true)}
              >
                {selectedServices.length > 0 
                  ? `${selectedServices.length} послуг обрано` 
                  : 'Обрати послуги ➜'}
              </button>
            </div>
            
            {selectedServices.length > 0 && (
              <div className="selected-services-list">
                {selectedServices.map(serviceId => {
                  const service = SERVICES.find(s => s.id === serviceId);
                  return (
                    <div key={serviceId} className="selected-service-item">
                      <span>{service?.name}</span>
                      <span>{service?.price} грн</span>
                      <button 
                        className="remove-service"
                        onClick={() => setSelectedServices(prev => prev.filter(id => id !== serviceId))}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                <div className="services-total">
                  Загальна сума: <strong>{totalPrice} грн</strong>
                </div>
              </div>
            )}
          </div>

          <button
            className="confirm"
            disabled={!isValid || loading}
            onClick={submit}
          >
            {loading ? "Відправка..." : `Підтвердити запис${totalPrice > 0 ? ` (${totalPrice} грн)` : ''}`}
          </button>
          
          {/* Модальное окно для выбора услуг */}
          {showServiceModal && (
            <div className="service-modal-backdrop" onClick={() => setShowServiceModal(false)}>
              <div className="service-modal" onClick={e => e.stopPropagation()}>
                <div className="service-modal-header">
                  <h3>Оберіть послуги</h3>
                  <button className="close-modal" onClick={() => setShowServiceModal(false)}>
                    ✕
                  </button>
                </div>
                
                <div className="service-modal-grid">
                  {SERVICES.map(service => (
                    <div
                      key={service.id}
                      className={`service-modal-item ${selectedServices.includes(service.id) ? "selected" : ""}`}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="service-modal-name">{service.name}</div>
                      <div className="service-modal-price">{service.price} грн</div>
                      {selectedServices.includes(service.id) && (
                        <div className="service-check">✓</div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="service-modal-footer">
                  <div className="modal-total">
                    Вибрано: {selectedServices.length} послуг • {totalPrice} грн
                  </div>
                  <button 
                    className="modal-confirm"
                    onClick={() => setShowServiceModal(false)}
                  >
                    Готово
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}