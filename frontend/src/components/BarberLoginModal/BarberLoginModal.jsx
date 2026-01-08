import { useState } from "react";
import "./BarberLoginModal.css";

export default function BarberLoginModal({ open, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const barberPasswords = {
    "admin": "barber123", // Общий пароль для всех барберов
    "suren": "suren123",
    "anush": "anush123",
    "kristina": "kristina123"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Проверяем пароль
    const validPasswords = Object.values(barberPasswords);
    if (validPasswords.includes(password)) {
      // Сохраняем в localStorage что барбер вошел
      localStorage.setItem("barberAuthenticated", "true");
      localStorage.setItem("barberLoginTime", new Date().toISOString());
      
      // Перенаправляем на админку
      window.location.href = "/#barber-admin";
      window.location.reload(); // Перезагружаем чтобы Home.jsx увидел хэш
    } else {
      setError("Невірний пароль");
    }
  };

  if (!open) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>✕</button>
        
        <h2>🔐 Вхід для барберів</h2>
        <p className="modal-subtitle">Тільки для персоналу барбершопу</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Введіть пароль"
              autoFocus
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-submit">
            Увійти
          </button>
        </form>
        
        <div className="password-hint">
          <p><strong>Паролі:</strong></p>
          <ul>
            <li>Загальний: <code>barber123</code></li>
            <li>Сурен: <code>suren123</code></li>
            <li>Ануш: <code>anush123</code></li>
            <li>Кристіна: <code>kristina123</code></li>
          </ul>
        </div>
        
        <div className="modal-note">
          <small>Після входу відкриється сторінка з календарем записів</small>
        </div>
      </div>
    </div>
  );
}