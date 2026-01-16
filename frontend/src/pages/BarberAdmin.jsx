// frontend/src/pages/BarberAdmin.jsx
import { useEffect, useState, useRef } from "react";
import "./BarberAdmin.css";

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

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
    
    // Получаем локальную дату из selectedDate
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

  // Закрытие datepicker при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Форматування дати
  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Часові слоти (добавлено 19:00)
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00", "19:00"
  ];

  // Знайти активну запис для барбера та часу
  const getActiveBooking = (barberId, time) => {
    return bookings.find(b => 
      b.barber?._id === barberId && 
      b.time === time &&
      b.status === "active"
    );
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

  // Обработчик выбора даты из календаря
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  // Форматирование даты для input type="date"
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // Обробник кліку на клітинку календаря
  const handleCellClick = (barber, time) => {
    const booking = getActiveBooking(barber._id, time);
    
    if (booking) {
      // Відкрити деталі існуючого запису
      setSelectedBooking({
        ...booking,
        barberName: barber.name,
        barberColor: barber.color
      });
    } else {
      // Створити новий запис
      createNewBooking(barber, time);
    }
  };

  // Створити новий запис (барбером)
  const createNewBooking = async (barber, time) => {
    const clientName = prompt(`📝 Створити запис для ${barber.name} на ${time}\n\nВведіть ім'я клієнта:`);
    if (!clientName || clientName.trim() === "") return;
    
    const phone = prompt("📞 Введіть номер телефону:");
    if (!phone || phone.trim().length < 10) {
      alert("❗ Будь ласка, введіть правильний номер телефону (10 цифр)");
      return;
    }

    const servicesInput = prompt("💈 Введіть послуги або коментар (необов'язково):");
    const services = servicesInput 
      ? servicesInput.split(',').map(s => s.trim()).filter(s => s)
      : [];

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      const startAt = new Date(`${date}T${time}:00`).toISOString();
      
      console.log("Створення запису:", { barberId: barber._id, date, time, clientName, phone });
      
      const response = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: barber._id,
          startAt,
          phone: phone.trim(),
          clientName: clientName.trim(),
          services
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Помилка створення запису");
      }
      
      const newBooking = await response.json();
      
      // Оновити список записів
      setBookings(prev => [...prev, newBooking]);
      alert(`✅ Запис створено!\n${barber.name} - ${time}\n${clientName} - ${phone}`);
      
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
        <div className="header-right" ref={datePickerRef}>
          {/* Кнопка для открытия календаря */}
          <button 
            className="selected-date"
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={{
              cursor: 'pointer',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📅 {formatDate(selectedDate)}
          </button>
          
          {/* Скрытый input для выбора даты */}
          {showDatePicker && (
            <div style={{
              position: 'absolute',
              // top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              padding: '20px',
              zIndex: 1000,
              minWidth: '300px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0 }}>Обрати дату</h3>
                <button 
                  onClick={() => setShowDatePicker(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}
              />
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={goToToday}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Сьогодні
                </button>
                <button
                  onClick={() => {
                    const tomorrow = new Date(selectedDate);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow);
                    setShowDatePicker(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Завтра
                </button>
              </div>
            </div>
          )}
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
                  const booking = getActiveBooking(barber._id, time);
                  
                  return (
                    <div
                      key={`${barber._id}-${time}`}
                      className={`booking-cell ${booking ? "booked" : "free"}`}
                      style={{
                        backgroundColor: booking ? barber.color : "transparent",
                        borderColor: barber.color
                      }}
                      onClick={() => handleCellClick(barber, time)}
                    >
                      {booking ? (
                        <div className="booking-info">
                          <div className="client-name">{booking.clientName}</div>
                          <div className="client-phone">{booking.phone}</div>
                          {booking.services && booking.services.length > 0 && (
                            <div className="service-indicator">
                              💈 {booking.services.length}
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
            <div className="color-box free">—</div>
            <span>Вільно</span>
          </div>
          <div className="legend-item">
            <div className="color-box indicator">💈</div>
            <span>Є послуги</span>
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
            <div className="stat-number">
              {new Date().toLocaleTimeString('uk-UA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="stat-label">Час</div>
          </div>
        </div>
      </footer>

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