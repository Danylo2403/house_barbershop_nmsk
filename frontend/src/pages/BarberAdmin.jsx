import { useEffect, useState } from "react";
import "./BarberAdmin.css";

export default function BarberAdmin({ onLogout }) {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");

  // Загрузить барберов
  useEffect(() => {
    fetch("http://localhost:5000/api/barbers")
      .then(res => res.json())
      .then(data => {
        console.log("📋 Barbers loaded:", data);
        setBarbers(data);
        if (data.length > 0) {
          setSelectedBarber(data[0]);
        }
      })
      .catch(err => console.error("❌ Error loading barbers:", err));
  }, []);

  // Загрузить записи при изменении барбера или даты
  useEffect(() => {
    if (!selectedBarber) return;

    setLoading(true);
    const dateStr = selectedDate.toISOString().split("T")[0];
    
    console.log(`📡 Loading bookings for ${selectedBarber.name} on ${dateStr}`);
    
    fetch(`http://localhost:5000/api/bookings/barber/${selectedBarber._id}?date=${dateStr}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("📦 Bookings data:", data);
        setBookings(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading bookings:", err);
        setBookings([]);
        setLoading(false);
      });
  }, [selectedBarber, selectedDate]);

  // Функции для работы с датами
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    // Начинаем с понедельника (0 - воскресенье, 1 - понедельник)
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Корректировка если воскресенье
    
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getTimeSlots = () => {
    return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  };

  const getBookingForSlot = (date, time) => {
    const dateStr = date.toISOString().split("T")[0];
    const booking = bookings.find(b => b.date === dateStr && b.time === time);
    return booking;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDay = (date) => {
    return date.toLocaleDateString('uk-UA', {
      weekday: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelectedDay = (date) => {
    const selected = new Date(selectedDate);
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  };

  // Переключение недель
  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  // Загрузить все записи
  const loadAllBookings = () => {
    if (!selectedBarber) return;
    
    setLoading(true);
    fetch(`http://localhost:5000/api/bookings/barber/${selectedBarber._id}/all`)
      .then(res => res.json())
      .then(data => {
        console.log("📋 All bookings:", data);
        setBookings(data || []);
        setViewMode("list");
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading all bookings:", err);
        setBookings([]);
        setLoading(false);
      });
  };

  // Вернуться к календарю
  const switchToCalendar = () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    setLoading(true);
    fetch(`http://localhost:5000/api/bookings/barber/${selectedBarber._id}?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        setBookings(data || []);
        setViewMode("calendar");
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error switching to calendar:", err);
        setBookings([]);
        setLoading(false);
      });
  };

  // Выбрать день в календаре
  const selectDay = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="barber-admin">
      {/* Шапка */}
      <header className="admin-header">
        <div className="header-left">
          <h1>📅 Календар записів</h1>
          <button className="logout-btn" onClick={onLogout}>
            ← Вийти
          </button>
        </div>
        
        <div className="header-right">
          {selectedBarber && (
            <div className="barber-selector">
              <span>Барбер: </span>
              <select 
                value={selectedBarber._id} 
                onChange={(e) => {
                  const barber = barbers.find(b => b._id === e.target.value);
                  setSelectedBarber(barber);
                }}
              >
                {barbers.map(barber => (
                  <option key={barber._id} value={barber._id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Управление */}
      <div className="admin-controls">
        <div className="date-navigation">
          <button className="nav-btn" onClick={prevWeek}>←</button>
          <div className="current-week">
            {formatDate(getWeekDates()[0])} - {formatDate(getWeekDates()[6])}
          </div>
          <button className="nav-btn" onClick={nextWeek}>→</button>
        </div>
        
        <div className="view-buttons">
          <button 
            className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
            onClick={switchToCalendar}
          >
            📅 Тиждень
          </button>
          <button 
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={loadAllBookings}
          >
            📋 Всі записи
          </button>
          <button 
            className="today-btn"
            onClick={() => {
              setSelectedDate(new Date());
              switchToCalendar();
            }}
          >
            Сьогодні
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <main className="admin-main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Завантаження записів...</p>
          </div>
        ) : viewMode === "calendar" ? (
          <>
            {/* Мини-календарь дней недели */}
            <div className="week-days">
              {getWeekDates().map((date, index) => (
                <button
                  key={index}
                  className={`day-btn ${isToday(date) ? "today" : ""} ${isSelectedDay(date) ? "selected" : ""}`}
                  onClick={() => selectDay(date)}
                >
                  <div className="day-weekday">{formatDay(date).split(" ")[0]}</div>
                  <div className="day-number">{date.getDate()}</div>
                  {bookings.filter(b => b.date === date.toISOString().split("T")[0]).length > 0 && (
                    <div className="day-badge">
                      {bookings.filter(b => b.date === date.toISOString().split("T")[0]).length}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Календарь на неделю */}
            <div className="calendar-week">
              <div className="time-column">
                <div className="time-header">Час</div>
                {getTimeSlots().map(time => (
                  <div key={time} className="time-slot">{time}</div>
                ))}
              </div>
              
              {getWeekDates().map((date, dayIndex) => (
                <div key={dayIndex} className={`day-column ${isToday(date) ? "today" : ""}`}>
                  <div className="day-header">
                    <div className="day-name">{formatDay(date)}</div>
                    {isToday(date) && <span className="today-badge">Сьогодні</span>}
                  </div>
                  
                  <div className="day-slots">
                    {getTimeSlots().map(time => {
                      const booking = getBookingForSlot(date, time);
                      return (
                        <div 
                          key={time} 
                          className={`time-cell ${booking ? "booked" : "free"}`}
                          title={booking ? `Телефон: ${booking.phone}\nЧас: ${booking.time}` : "Вільно"}
                        >
                          {booking ? (
                            <div className="booking-info">
                              <div className="client-name">📱 {booking.phone}</div>
                              <div className="booking-time-small">{booking.time}</div>
                            </div>
                          ) : (
                            <div className="free-slot">—</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Легенда и статистика */}
            <div className="calendar-footer">
              <div className="calendar-legend">
                <div className="legend-item">
                  <div className="legend-color free"></div>
                  <span>Вільно</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color booked"></div>
                  <span>Заброньовано</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color today"></div>
                  <span>Сьогодні</span>
                </div>
              </div>
              
              <div className="calendar-stats">
                <div className="stat-item">
                  <span className="stat-number">{bookings.length}</span>
                  <span className="stat-label">всього записів</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {bookings.filter(b => {
                      const bookingTime = parseInt(b.time.split(":")[0]);
                      return bookingTime < new Date().getHours();
                    }).length}
                  </span>
                  <span className="stat-label">раніше</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {bookings.filter(b => {
                      const bookingTime = parseInt(b.time.split(":")[0]);
                      return bookingTime >= new Date().getHours();
                    }).length}
                  </span>
                  <span className="stat-label">пізніше</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Список всех записей */
          <div className="all-bookings-list">
            <div className="list-header">
              <h2>Всі записи</h2>
              <div className="total-count">{bookings.length} записів</div>
            </div>
            
            {bookings.length === 0 ? (
              <div className="no-bookings">
                <div className="empty-icon">📭</div>
                <p>Ще немає записів</p>
                <p className="sub">Коли клієнти запишуться, вони з'являться тут</p>
              </div>
            ) : (
              <div className="bookings-by-date">
                {(() => {
                  const groups = {};
                  bookings.forEach(b => {
                    if (!groups[b.date]) groups[b.date] = [];
                    groups[b.date].push(b);
                  });
                  
                  return Object.entries(groups)
                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    .map(([date, dayBookings]) => (
                      <div key={date} className="date-section">
                        <div className="section-header">
                          <h3 className="section-date">
                            {new Date(date).toLocaleDateString('uk-UA', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </h3>
                          <span className="section-count"> ({dayBookings.length})</span>
                        </div>
                        
                        <div className="bookings-grid">
                          {dayBookings.sort((a, b) => a.time.localeCompare(b.time)).map(booking => (
                            <div key={booking._id} className="booking-item">
                              <div className="booking-time">{booking.time}</div>
                              <div className="booking-details">
                                <div className="booking-client">
                                  <span className="phone-icon">📱</span>
                                  <span className="phone-number">{booking.phone}</span>
                                </div>
                                <div className="booking-meta">
                                  <span className="booking-id">ID: {booking._id?.slice(-6) || 'N/A'}</span>
                                  <span className="booking-created">
                                    {new Date(booking.createdAt).toLocaleTimeString('uk-UA', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Футер */}
      <footer className="admin-footer">
        <div className="footer-info">
          <div className="info-item">
            <span className="info-label">Барбер:</span>
            <span className="info-value">{selectedBarber?.name || "Не вибрано"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Оновлено:</span>
            <span className="info-value">{new Date().toLocaleTimeString('uk-UA')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Режим:</span>
            <span className="info-value">{viewMode === "calendar" ? "Календар" : "Список"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}