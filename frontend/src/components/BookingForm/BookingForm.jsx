import { useState } from "react";
import { createBooking } from "../../services/api";
import BookingCalendar from "../BookingSheet/BookingCalendar";
import "./BookingForm.css";

// Список услуг (такой же как в BookingSheet)
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

export default function BookingForm({ barber, onSuccess }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const submit = async () => {
    console.log("CLICK", { date, time, phone, clientName, selectedService });

    if (!date || !time || !phone || !clientName.trim()) {
      alert("Заповніть всі обов'язкові поля");
      return;
    }

    await createBooking({
      barberId: barber._id,
      date,
      time,
      phone,
      clientName: clientName.trim(),
      services: selectedService ? [selectedService] : []
    });

    alert("Запис підтверджено ✅");
    onSuccess();
  };

  const selectedServiceObj = SERVICES.find(s => s.id === selectedService);
  const totalPrice = selectedServiceObj ? selectedServiceObj.price : 0;

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
        <option value="14:00">14:00</option>
        <option value="15:00">15:00</option>
        <option value="16:00">16:00</option>
        <option value="17:00">17:00</option>
        <option value="18:00">18:00</option>
      </select>

      <input
        className="name-input"
        placeholder="Ваше ім'я"
        value={clientName}
        onChange={e => setClientName(e.target.value)}
      />

      <input
        placeholder="Телефон"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <select 
        className="services-select"
        value={selectedService} 
        onChange={e => setSelectedService(e.target.value)}
      >
        <option value="">Оберіть послугу (не обов'язково)</option>
        {SERVICES.map(service => (
          <option key={service.id} value={service.id}>
            {service.name} - {service.price} грн
          </option>
        ))}
      </select>

      {selectedService && (
        <div className="price-display">
          Вартість: <strong>{totalPrice} грн</strong>
        </div>
      )}

      <button className="confirm-btn" onClick={submit}>
        {totalPrice > 0 ? `Підтвердити (${totalPrice} грн)` : "Підтвердити запис"}
      </button>
    </div>
  );
}