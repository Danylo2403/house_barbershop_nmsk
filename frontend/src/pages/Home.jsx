import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Barbers from "../components/Barbers/Barbers";
import Gallery from "../components/Gallery/Gallery"; // Добавьте этот импорт
import Footer from "../components/Footer/Footer";
import BookingSheet from "../components/BookingSheet/BookingSheet";
import BarberAdmin from "./BarberAdmin";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);

  // Проверяем при каждом изменении URL
  useEffect(() => {
    const checkAdminAccess = () => {
      const hash = window.location.hash;
      const isAuthenticated = localStorage.getItem("barberAuthenticated") === "true";
      
      console.log("🔍 Checking URL:", {
        hash,
        isAuthenticated,
        fullURL: window.location.href
      });
      
      if (hash === "#barber-admin" && isAuthenticated) {
        console.log("✅ Showing admin panel");
        setShowAdmin(true);
      } else {
        console.log("❌ Not showing admin");
        setShowAdmin(false);
      }
    };

    // Проверяем сразу
    checkAdminAccess();
    
    // И слушаем изменения хэша
    const handleHashChange = () => {
      checkAdminAccess();
    };
    
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Проверяем авторизацию каждую минуту
  useEffect(() => {
    const checkAuthExpiry = () => {
      const loginTime = localStorage.getItem("barberLoginTime");
      if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          localStorage.removeItem("barberAuthenticated");
          localStorage.removeItem("barberLoginTime");
          if (window.location.hash === "#barber-admin") {
            window.location.hash = "";
            window.location.reload();
          }
        }
      }
    };
    
    checkAuthExpiry();
    const interval = setInterval(checkAuthExpiry, 60000); // Каждую минуту
    
    return () => clearInterval(interval);
  }, []);

  // Загружаем барберов только для главной
  useEffect(() => {
    if (showAdmin) {
      console.log("🚫 Skipping barber fetch - showing admin");
      return;
    }
    
    console.log("📡 Fetching barbers for main page");
    fetch("http://localhost:5000/api/barbers")
      .then(res => res.json())
      .then(data => {
        console.log("📥 BARBERS FROM API:", data);
        setBarbers(data);
      })
      .catch(err => console.error("❌ Fetch error:", err));
  }, [showAdmin]);

  // Функция выхода из админки
  const handleLogout = () => {
    console.log("🚪 Logging out from admin");
    localStorage.removeItem("barberAuthenticated");
    localStorage.removeItem("barberLoginTime");
    setShowAdmin(false);
    window.location.hash = "";
    window.location.reload();
  };

  // Добавим дебаг вывод
  console.log("🏠 Home component render:", {
    showAdmin,
    barbersCount: barbers.length,
    selectedBarber: selectedBarber?.name,
    hash: window.location.hash,
    auth: localStorage.getItem("barberAuthenticated")
  });

  // Если показываем админку
  if (showAdmin) {
    console.log("🎯 Rendering BarberAdmin");
    return <BarberAdmin onLogout={handleLogout} />;
  }

  // Иначе показываем обычную страницу
  console.log("🎯 Rendering main page");
  return (
    <>
      <Header />
      <Hero />

      <Barbers
        barbers={barbers}
        onSelect={setSelectedBarber}
      />

      {/* Добавьте компонент Gallery здесь */}
      <Gallery />

      <Footer />

      <BookingSheet
        open={!!selectedBarber}
        barber={selectedBarber}
        onClose={() => setSelectedBarber(null)}
      />

      {/* Скрытая кнопка для дебага */}
      <div style={{ 
        
      }}>
        Hash: {window.location.hash}<br />
        Auth: {localStorage.getItem("barberAuthenticated") || 'false'}
      </div>
    </>
  );
}