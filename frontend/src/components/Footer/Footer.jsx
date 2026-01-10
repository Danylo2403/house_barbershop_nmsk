import "./Footer.css";
import { useState } from "react";
import BarberLoginModal from "../BarberLoginModal/BarberLoginModal";

export default function Footer() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-wrapper">
          {/* Верхняя часть */}
          <div className="footer-top">
            <div className="footer-logo">
              <div className="scissors">✂️</div>
              <h2>House<br />Barbershop</h2>
            </div>
            
            <div className="footer-social">
              <a 
                href="https://www.instagram.com/house_barbershop_nmsk?igsh=MTZycTIwajQyOWF5NQ==" 
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-btn"
              >
                <span>📷</span>
                Instagram
              </a>
            </div>
          </div>
          
          {/* Средняя часть с информацией */}
          <div className="footer-middle">
            <div className="footer-column">
              <h3>Контакти</h3>
              <div className="contact-info">
                <p><span>📞</span> +38 095 054 53 31</p>
                <p><span>📍</span> м. Самар, вул. Гетьманська 48</p>
              </div>
            </div>
            
            <div className="footer-column">
              <h3>Години роботи</h3>
              <div className="working-hours">
                <p><span>🕐</span> Пн-Пт: 9:00 - 19:00</p>
                <p><span>🕐</span> Сб-Нд: 9:00 - 19:00</p>
              </div>
            </div>
            
            <div className="footer-column">
              {/* <h3>Меню</h3> */}
              <nav className="footer-nav">
                {/* <a href="#home">Головна</a> */}
                {/* <a href="#barbers">Барбери</a> */}
                {/* <a href="#services">Послуги</a> */}
                {/* <a href="#contacts">Контакти</a> */}
              </nav>
            </div>
          </div>
          
          {/* Нижняя часть */}
          <div className="footer-bottom">
            <p className="copyright">
              © {new Date().getFullYear()} House Barbershop. Всі права захищені.
            </p>
            
            {/* Кнопка входа для барберов */}
            <button 
              className="barber-login-btn"
              onClick={() => setShowLoginModal(true)}
            >
              🔐 Вхід для барберів
            </button>
            
            <p className="made-with">✂️ Стрижемо з любов'ю</p>
          </div>
        </div>
      </footer>

      {/* Модальное окно для входа барберов */}
      <BarberLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}