// frontend/src/pages/BarberAdmin.jsx
import { useEffect, useState } from "react";
import "./BarberAdmin.css";
import BookingForm from "../components/BookingForm/BookingForm";

// СЛОВНИК ПОСЛУГ
const SERVICE_NAMES = {
  haircut: "Стрижка",
  haircut_beard: "Стрижка + борода",
  machine_haircut: "Стрижка під машинку насадками",
  machine_haircut_beard: "Стрижка під машинку + борода",
  long_haircut: "Подовжена стрижка",
  father_son: "Батько + син (до 10 років)",
  beard_design: "+ оформлення бороди",
  father_two_sons: "Батько + син + син (до 10 років)",
  beard_grooming: "Оформлення бороди",
  haircut_shave: "Стрижка + гоління обличчя",
  head_shave_beard: "Гоління голови + грумінг бороди",
  royal_shave: "Королівське гоління голови + бороди",
  kids_under_10: "Дитяча стрижка до 10 років",
  teen_10_14: "Підліткова стрижка (10-14 років)",
  hair_styling: "Укладання волосся",
  hair_trim: "Окантовка волосся",
  wax_one_zone: "Воск однієї зони",
  complex_styling: "Комплекс",
  head_camouflage: "Камуфляж голови",
  beard_camouflage: "Камуфляж бороди",
  head_peeling: "Пілінг голови"
};

export default function BarberAdmin({ onLogout }) {
  const [barbers, setBarbers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  // Завантажити барберів
  useEffect(() => {
    fetch("/api/barbers")
      .then(res => res.json())
      .then(data => {
        console.log("✅ Загружено барберов:", data.length);
        setBarbers(data);
      })
      .catch(err => console.error("❌ Ошибка загрузки барберов:", err));
  }, []);

  // Завантажити записи на вибрану дату
  useEffect(() => {
    setLoading(true);
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log("📅 Загружаю записи на дату:", dateStr);
    
    fetch(`/api/bookings/all?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        console.log("✅ Получено записей:", data.length);
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Ошибка загрузки записей:", err);
        setLoading(false);
      });
  }, [selectedDate]);

  // Форматування дати
  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Час з интервалом в 15 минут (простой вариант)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) break; // Только 18:00
      timeSlots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
  }

  // Длительность услуг (в минутах)
  const SERVICE_DURATION = {
    haircut: 60,
    haircut_beard: 90,
    machine_haircut: 45,
    machine_haircut_beard: 75,
    long_haircut: 90,
    father_son: 120,
    beard_design: 30,
    father_two_sons: 150,
    beard_grooming: 60,
    haircut_shave: 90,
    head_shave_beard: 90,
    royal_shave: 120,
    kids_under_10: 45,
    teen_10_14: 60,
    hair_styling: 30,
    hair_trim: 20,
    wax_one_zone: 15,
    complex_styling: 60,
    head_camouflage: 90,
    beard_camouflage: 60,
    head_peeling: 75
  };

  // Знайти запис для барбера та часу
  const getBookingForSlot = (barberId, time) => {
    const booking = bookings.find(b => 
      b.barber?._id === barberId && 
      b.time === time &&
      b.status === "active"
    );
    
    if (booking) return booking;
    
    // Если нет точного совпадения, ищем записи, которые могут занимать этот слот
    // (упрощенная проверка - только по начальному времени)
    return null;
  };

  // Проверяем, свободен ли слот
  const isSlotFree = (barberId, time) => {
    const booking = getBookingForSlot(barberId, time);
    return !booking;
  };

  // Навігація по днях
  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Функція для отримання назви послуги
  const getServiceName = (serviceId) => {
    return SERVICE_NAMES[serviceId] || serviceId;
  };

  // Отримати загальну суму для запису
  const getTotalPrice = (services) => {
    const prices = {
      haircut: 800,
      haircut_beard: 1000,
      machine_haircut: 650,
      machine_haircut_beard: 850,
      long_haircut: 800,
      father_son: 1250,
      beard_design: 300,
      father_two_sons: 1500,
      beard_grooming: 700,
      haircut_shave: 1000,
      head_shave_beard: 1000,
      royal_shave: 1000,
      kids_under_10: 600,
      teen_10_14: 700,
      hair_styling: 300,
      hair_trim: 200,
      wax_one_zone: 150,
      complex_styling: 450,
      head_camouflage: 500,
      beard_camouflage: 400,
      head_peeling: 350
    };
    
    if (!services || services.length === 0) return 0;
    
    return services.reduce((total, serviceId) => {
      return total + (prices[serviceId] || 0);
    }, 0);
  };

  // Получить длительность записи (в минутах)
  const getBookingDuration = (services) => {
    if (!services || services.length === 0) return 60;
    
    const maxDuration = Math.max(...services.map(s => SERVICE_DURATION[s] || 60));
    return maxDuration;
  };

  // === ОБРАБОТЧИКИ ===

  // Обробник кліку на клітинку календаря
  const handleCellClick = (barber, time) => {
    const booking = getBookingForSlot(barber._id, time);
    
    if (booking) {
      // Відкрити деталі існуючого запису
      setSelectedBooking({
        ...booking,
        barberName: barber.name,
        barberColor: barber.color
      });
    } else {
      // Открыть форму для создания записи
      setSelectedBarber(barber);
      setSelectedTime(time);
      setShowForm(true);
    }
  };

  // Создание записи через форму
  const createBooking = async (bookingData) => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      const startAt = new Date(`${date}T${selectedTime}:00`).toISOString();
      
      console.log("Создание записи:", { 
        barberId: selectedBarber._id, 
        date, 
        time: selectedTime, 
        ...bookingData 
      });
      
      const response = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarber._id,
          startAt,
          phone: bookingData.phone.trim(),
          clientName: bookingData.clientName.trim(),
          services: bookingData.services || []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Помилка створення запису");
      }
      
      const newBooking = await response.json();
      
      // Оновити список записів
      setBookings(prev => [...prev, newBooking]);
      
      // Закрыть форму
      setShowForm(false);
      setSelectedBarber(null);
      setSelectedTime("");
      
      alert(`✅ Запис створено!\n${selectedBarber.name} - ${selectedTime}\n${bookingData.clientName} - ${bookingData.phone}`);
      
    } catch (error) {
      console.error("Помилка створення запису:", error);
      alert(`❌ Помилка: ${error.message}`);
    }
  };

  // Скасувати запис
  const cancelBooking = async (bookingId) => {
    if (!confirm("Ви впевнені, що хочете скасувати цей запис?")) return;
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reason: "Скасовано барбером" 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Помилка скасування");
      }
      
      const cancelledBooking = await response.json();
      
      // Оновити запис в списку
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? cancelledBooking : b
      ));
      
      // Закрити модальне вікно
      closeModal();
      
      alert("✅ Запис скасовано");
      
    } catch (error) {
      console.error("Помилка скасування:", error);
      alert(`❌ Помилка: ${error.message}`);
    }
  };

  // Видалити запис назавжди
  const deleteBooking = async (bookingId) => {
    if (!confirm("⚠️ УВАГА!\n\nВидалити запис назавжди?\nЦю дію не можна скасувати.")) return;
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Помилка видалення");
      }
      
      // Видалити запис зі списку
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      
      // Закрити модальне вікно
      closeModal();
      
      alert("🗑️ Запис видалено назавжди");
      
    } catch (error) {
      console.error("Помилка видалення:", error);
      alert(`❌ Помилка: ${error.message}`);
    }
  };

  // Закрити модальне вікно
  const closeModal = () => {
    setSelectedBooking(null);
  };

  // Закрыть форму создания
  const closeForm = () => {
    setShowForm(false);
    setSelectedBarber(null);
    setSelectedTime("");
  };

  return (
    <div className="barber-admin">
      {/* Шапка */}
      <header className="admin-header">
        <div className="header-left">
          <h1>📅 Адмін-панель барбера</h1>
          <button className="logout-btn" onClick={onLogout}>
            ← Вийти
          </button>
        </div>
        <div className="header-right">
          <div className="selected-date">{formatDate(selectedDate)}</div>
        </div>
      </header>

      {/* Навігація */}
      <div className="navigation">
        <button className="nav-btn" onClick={prevDay}>
          ← Вчора
        </button>
        <button className="nav-btn today" onClick={goToToday}>
          Сьогодні
        </button>
        <button className="nav-btn" onClick={nextDay}>
          Завтра →
        </button>
      </div>

      {/* Календар */}
      <main className="calendar-container">
        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : (
          <div className="multi-calendar">
            {/* Заголовок з іменами барберів */}
            <div className="calendar-header">
              <div className="time-column">Час</div>
              {barbers.map(barber => (
                <div 
                  key={barber._id} 
                  className="barber-column-header"
                  style={{ backgroundColor: barber.color }}
                >
                  {barber.name}
                </div>
              ))}
            </div>

            {/* Часові рядки */}
            {timeSlots.map(time => (
              <div key={time} className="time-row">
                <div className="time-cell">{time}</div>
                
                {barbers.map(barber => {
                  const booking = getBookingForSlot(barber._id, time);
                  const isFree = !booking;
                  
                  return (
                    <div
                      key={`${barber._id}-${time}`}
                      className={`booking-cell ${isFree ? "free" : "booked"}`}
                      style={{
                        backgroundColor: booking ? barber.color : "transparent",
                        borderColor: barber.color
                      }}
                      onClick={() => handleCellClick(barber, time)}
                      title={booking ? `Запис: ${booking.clientName}` : `Клікніть щоб створити запис на ${time}`}
                    >
                      {booking ? (
                        <div className="booking-info">
                          <div className="client-name">{booking.clientName}</div>
                          <div className="client-phone">{booking.phone}</div>
                          {booking.services && booking.services.length > 0 && (
                            <div className="service-indicator">
                              💈 {getBookingDuration(booking.services)}хв
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="free-text">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Легенда */}
      <div className="legend">
        <h3>Легенда:</h3>
        <div className="legend-items">
          {barbers.map(barber => (
            <div key={barber._id} className="legend-item">
              <div 
                className="color-box" 
                style={{ backgroundColor: barber.color }}
              />
              <span>{barber.name}</span>
            </div>
          ))}
          <div className="legend-item">
            <div className="color-box free">+</div>
            <span>Вільно (клікніть щоб створити)</span>
          </div>
          <div className="legend-item">
            <div className="color-box indicator">💈</div>
            <span>Показує тривалість послуг</span>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <footer className="stats-footer">
        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">
              {bookings.filter(b => b.status === "active").length}
            </div>
            <div className="stat-label">Активних записів</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{barbers.length}</div>
            <div className="stat-label">Барберів</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{timeSlots.length}</div>
            <div className="stat-label">Слотів</div>
          </div>
        </div>
      </footer>

      {/* Форма создания записи */}
      {showForm && selectedBarber && (
        <div className="form-modal-overlay" onClick={closeForm}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>Створити запис</h2>
              <button className="form-modal-close" onClick={closeForm}>
                ×
              </button>
            </div>
            
            <div className="form-modal-body">
              <div className="form-info">
                <p><strong>Барбер:</strong> {selectedBarber.name}</p>
                <p><strong>Дата:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Час:</strong> {selectedTime}</p>
              </div>
              
              <BookingForm 
                barber={selectedBarber}
                defaultTime={selectedTime}
                defaultDate={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                onSuccess={(bookingData) => {
                  createBooking(bookingData);
                }}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно деталей запису */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Деталі запису</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Статус */}
              <div className="detail-row">
                <div className="detail-label">Статус:</div>
                <div className={`detail-value ${selectedBooking.status === "cancelled" ? "status-cancelled" : "status-active"}`}>
                  {selectedBooking.status === "active" ? "✅ Активний" : "❌ Скасовано"}
                </div>
              </div>
              
              {/* Барбер */}
              <div className="detail-row">
                <div className="detail-label">Барбер:</div>
                <div 
                  className="detail-value barber-name"
                  style={{ color: selectedBooking.barberColor }}
                >
                  {selectedBooking.barberName}
                </div>
              </div>
              
              {/* Дата та час */}
              <div className="detail-row">
                <div className="detail-label">Дата:</div>
                <div className="detail-value">
                  {formatDate(new Date(selectedBooking.date + "T00:00:00"))}
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Час:</div>
                <div className="detail-value time">{selectedBooking.time}</div>
              </div>
              
              {/* Длительность */}
              <div className="detail-row">
                <div className="detail-label">Тривалість:</div>
                <div className="detail-value">
                  {getBookingDuration(selectedBooking.services)} хвилин
                </div>
              </div>
              
              {/* Клієнт */}
              <div className="detail-section">
                <h3>👤 Клієнт</h3>
                <div className="detail-row">
                  <div className="detail-label">Ім'я:</div>
                  <div className="detail-value">{selectedBooking.clientName}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Телефон:</div>
                  <div className="detail-value phone">{selectedBooking.phone}</div>
                </div>
              </div>
              
              {/* Послуги */}
              <div className="detail-section">
                <h3>💈 Послуги</h3>
                {selectedBooking.services && selectedBooking.services.length > 0 ? (
                  <>
                    <div className="services-list">
                      {selectedBooking.services.map((serviceId, index) => (
                        <div key={index} className="service-item">
                          <div className="service-name">{getServiceName(serviceId)}</div>
                          <div className="service-duration">
                            {SERVICE_DURATION[serviceId] || 60} хв
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="total-price">
                      Загальна сума: <strong>{getTotalPrice(selectedBooking.services)} грн</strong>
                    </div>
                  </>
                ) : (
                  <div className="no-services">Послуги не вказані</div>
                )}
              </div>
              
              {/* Додаткова інформація */}
              <div className="detail-section">
                <h3>📋 Додатково</h3>
                <div className="detail-row">
                  <div className="detail-label">ID запису:</div>
                  <div className="detail-value id">{selectedBooking._id?.slice(-8)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Створено:</div>
                  <div className="detail-value">
                    {new Date(selectedBooking.createdAt).toLocaleString('uk-UA')}
                  </div>
                </div>
                {selectedBooking.status === "cancelled" && (
                  <div className="detail-row">
                    <div className="detail-label">Скасовано:</div>
                    <div className="detail-value">
                      {new Date(selectedBooking.updatedAt).toLocaleString('uk-UA')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-btn close-btn" onClick={closeModal}>
                Закрити
              </button>
              
              {selectedBooking.status === "active" ? (
                <button 
                  className="modal-btn cancel-btn"
                  onClick={() => cancelBooking(selectedBooking._id)}
                >
                  ❌ Скасувати
                </button>
              ) : (
                <button 
                  className="modal-btn delete-btn"
                  onClick={() => deleteBooking(selectedBooking._id)}
                >
                  🗑️ Видалити
                </button>
              )}
              
              <button 
                className="modal-btn call-btn"
                onClick={() => window.open(`tel:${selectedBooking.phone}`)}
              >
                📞 Зателефонувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}