// frontend/src/pages/BarberAdmin.jsx
import { useEffect, useState } from "react";
import "./BarberAdmin.css";

// СЛОВНИК ПОСЛУГ (добавьте в начало)
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
  const [selectedBooking, setSelectedBooking] = useState(null); // НОВОЕ: выбранная запись

  // Завантажити барберів
  useEffect(() => {
    fetch("/api/barbers")
      .then(res => res.json())
      .then(data => {
        setBarbers(data);
      });
  }, []);

  // Завантажити записи на вибрану дату
  useEffect(() => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split("T")[0];
    
    fetch(`/api/bookings/all?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  // Форматування дати
  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Часові слоти (з 9:00 до 18:00)
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00"
  ];

  // Знайти запис для барбера та часу
  const getBooking = (barberId, time) => {
    return bookings.find(b => 
      b.barber?._id === barberId && 
      b.time === time
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

  // Функція для отримання назви послуги
  const getServiceName = (serviceId) => {
    return SERVICE_NAMES[serviceId] || serviceId;
  };

  // Обробник кліку на запис
  const handleBookingClick = (booking, barber) => {
    if (booking) {
      setSelectedBooking({
        ...booking,
        barberName: barber.name,
        barberColor: barber.color
      });
    }
  };

  // Закрити модальне вікно
  const closeModal = () => {
    setSelectedBooking(null);
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

  return (
    <div className="barber-admin">
      {/* Шапка */}
      <header className="admin-header">
        <div className="header-left">
          <h1>📅 Загальний календар</h1>
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
                  const booking = getBooking(barber._id, time);
                  
                  return (
                    <div
                      key={`${barber._id}-${time}`}
                      className={`booking-cell ${booking ? "booked" : "free"}`}
                      style={{
                        backgroundColor: booking ? barber.color : "transparent",
                        borderColor: barber.color
                      }}
                      onClick={() => handleBookingClick(booking, barber)}
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
                        <span className="free-text">—</span>
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
            <div className="stat-number">{bookings.length}</div>
            <div className="stat-label">Всього записів</div>
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
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-btn close-btn" onClick={closeModal}>
                Закрити
              </button>
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