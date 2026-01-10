import "./Header.css";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип в одну линию */}
        <div className="logo">
          <div className="logo-text">
            <span className="logo-title">HOUSE</span>
            <span className="logo-subtitle">BARBERSHOP</span>
            {/* <span className="logo-tagline">OF SELAVES</span> */}
          </div>
        </div>

        {/* Телефон для мобильных */}
        {/* <a href="tel:0950545331" className="mobile-phone">
          📞
        </a> */}

        {/* Бургер-меню для мобильных */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
        >
          <div className="hamburger">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </button>

        {/* Телефон для десктопа */}
        <div className="header-contact">
          <a href="tel:0950545331" className="phone-link">
            <span className="phone-number">095 054 5331</span>
          </a>
        </div>
      </div>

      {/* Мобильное меню */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-container">
          <nav className="mobile-nav">
            {/* <ul className="mobile-nav-list">
              <li><a href="#home" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Головна
              </a></li>
              <li><a href="#barbers" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Барбери
              </a></li>
              <li><a href="#services" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Послуги
              </a></li>
              <li><a href="#gallery" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Галерея
              </a></li>
              <li><a href="#contacts" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Контакти
              </a></li>
            </ul> */}
          </nav>
          
          <div className="mobile-contact">
            <a href="tel:0950545331" className="mobile-phone-link">
              <span className="phone-emoji">📞</span>
              <div className="phone-info">
                <span className="phone-label">Телефон</span>
                <span className="phone-number">095 054 5331</span>
              </div>
            </a>
            
            <div className="mobile-hours">
              <span className="hours-emoji">🕒</span>
              <div className="hours-info">
                <span className="hours-label">Графік роботи</span>
                <span className="hours-text">Пн-Нд: 9:00 - 19:00</span>
              </div>
            </div>
            
            {/* <a 
              href="#booking" 
              className="mobile-booking-button"
              onClick={() => setIsMenuOpen(false)}
            >
              Записатись
            </a> */}
          </div>
        </div>
      </div>
    </header>
  );
}