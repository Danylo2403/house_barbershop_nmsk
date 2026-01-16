import { useEffect, useState, useRef } from "react";
import "./BarberAdmin.css";

export default function BarberAdmin({ onLogout }) {
  const [barbers, setBarbers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  const [weekendDays, setWeekendDays] = useState([]);

  // Состояния для формы создания записи
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    barber: null,
    time: '',
    note: ''
  });

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

  // Часові слоти
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

  // Перевірити чи вихідний день
  const isWeekendDay = () => {
    const dayOfWeek = selectedDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
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

  // Обробник кліку на клітинку календаря
  const handleCellClick = (barber, time) => {
    const booking = getActiveBooking(barber._id, time);
    
    if (booking) {
      setSelectedBooking({
        ...booking,
        barberName: barber.name,
        barberColor: barber.color
      });
    } else {
      openBookingForm(barber, time);
    }
  };

  // Відкрити форму створення запису
  const openBookingForm = (barber, time) => {
    if (isWeekendDay()) return;
    
    setFormData({
      barber,
      time,
      note: ''
    });
    setShowBookingForm(true);
  };

  // Закрити форму створення запису
  const closeBookingForm = () => {
    setShowBookingForm(false);
    setFormData({
      barber: null,
      time: '',
      note: ''
    });
  };

  // Створити новий запис
  const createNewBooking = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      const startAt = new Date(`${date}T${formData.time}:00`).toISOString();
      
      // Используем note как services
      const services = formData.note ? [formData.note] : [];
      
      const response = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: formData.barber._id,
          startAt,
          phone: "", // Пустая строка
          clientName: "", // Пустая строка
          services
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Помилка створення запису");
      }
      
      const newBooking = await response.json();
      
      setBookings(prev => [...prev, newBooking]);
      closeBookingForm();
      alert(`✅ Запис створено!\n${formData.barber.name} - ${formData.time}`);
      
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
      
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? cancelledBooking : b
      ));
      
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
      
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      closeModal();
      alert("🗑️ Запис видалено назавжди");
      
    } catch (error) {
      console.error("Помилка видалення:", error);
      alert(`❌ Помилка: ${error.message}`);
    }
  };

  // Закрити модальне вікно деталей запису
  const closeModal = () => {
    setSelectedBooking(null);
  };

  // Получить заметку из записи
  const getBookingNote = (booking) => {
    if (booking.services && booking.services.length > 0) {
      return booking.services[0];
    }
    return booking.clientName || "";
  };

  return (
    <div className="barber-admin">
      {/* Шапка */}
      <header className="admin-header">
        <div className="header-left">
          <button className="logout-btn" onClick={onLogout}>
            ← Вийти
          </button>
        </div>
        <div className="header-center">
          <div className="selected-date">{formatDate(selectedDate)}</div>
          {isWeekendDay() && <div className="weekend-indicator">Вихідний</div>}
        </div>
        <div className="header-right" ref={datePickerRef}>
          <button 
            className="date-picker-btn"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            📅
          </button>
          
          {showDatePicker && (
            <div className="date-picker-dropdown">
              <div className="date-picker-header">
                <h3>Обрати дату</h3>
                <button onClick={() => setShowDatePicker(false)}>✕</button>
              </div>
              
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="date-input"
              />
              
              <div className="date-picker-buttons">
                <button onClick={goToToday}>
                  Сьогодні
                </button>
                <button onClick={() => {
                  const tomorrow = new Date(selectedDate);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  setShowDatePicker(false);
                }}>
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
        ) : isWeekendDay() ? (
          <div className="weekend-message">
            <h3>Вихідний день</h3>
            <p>На цей день записів немає</p>
          </div>
        ) : (
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="time-header">Час</th>
                {barbers.map(barber => (
                  <th 
                    key={barber._id} 
                    className="barber-header"
                    style={{ backgroundColor: barber.color }}
                  >
                    {barber.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time} className="time-row">
                  <td className="time-cell">{time}</td>
                  
                  {barbers.map(barber => {
                    const booking = getActiveBooking(barber._id, time);
                    const note = booking ? getBookingNote(booking) : '';
                    
                    return (
                      <td
                        key={`${barber._id}-${time}`}
                        className={`booking-cell ${booking ? "booked" : "free"}`}
                        style={{
                          backgroundColor: booking ? barber.color : "transparent"
                        }}
                        onClick={() => handleCellClick(barber, time)}
                      >
                        {booking ? (
                          <div className="booking-note">
                            {note}
                          </div>
                        ) : (
                          <span className="free-slot">+</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
        </div>
      </div>

      {/* Форма створення запису */}
      {showBookingForm && (
        <div className="form-modal-overlay" onClick={closeBookingForm}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>Створити запис</h2>
              <button className="form-modal-close" onClick={closeBookingForm}>
                ×
              </button>
            </div>
            
            <div className="form-modal-body">
              <div className="form-info">
                <p><strong>Барбер:</strong> {formData.barber.name}</p>
                <p><strong>Час:</strong> {formData.time}</p>
                <p><strong>Дата:</strong> {formatDate(selectedDate)}</p>
              </div>
              
              <div className="form-group">
                <label>Замітка (необов'язково)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Введіть замітку..."
                  rows={4}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="form-modal-footer">
              <button 
                className="modal-btn cancel-btn"
                onClick={closeBookingForm}
              >
                Скасувати
              </button>
              <button 
                className="modal-btn save-btn"
                onClick={createNewBooking}
              >
                Створити запис
              </button>
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
              
              {/* Замітка */}
              <div className="detail-section">
                <h3>📝 Замітка</h3>
                {getBookingNote(selectedBooking) ? (
                  <div className="booking-note-detail">
                    {getBookingNote(selectedBooking)}
                  </div>
                ) : (
                  <div className="no-note">Замітка відсутня</div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}