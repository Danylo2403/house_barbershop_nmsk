import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Barbers from "../components/Barbers/Barbers";
import Gallery from "../components/Gallery/Gallery";
import Footer from "../components/Footer/Footer";
import BookingSheet from "../components/BookingSheet/BookingSheet";
import BarberAdmin from "./BarberAdmin";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);

  /* ================= ADMIN MODE ================= */

  useEffect(() => {
    const checkAdminAccess = () => {
      const hash = window.location.hash;
      const isAuthenticated =
        localStorage.getItem("barberAuthenticated") === "true";

      if (hash === "#barber-admin" && isAuthenticated) {
        setShowAdmin(true);
      } else {
        setShowAdmin(false);
      }
    };

    checkAdminAccess();
    window.addEventListener("hashchange", checkAdminAccess);

    return () => window.removeEventListener("hashchange", checkAdminAccess);
  }, []);

  useEffect(() => {
    const checkAuthExpiry = () => {
      const loginTime = localStorage.getItem("barberLoginTime");
      if (!loginTime) return;

      const hours =
        (new Date() - new Date(loginTime)) / (1000 * 60 * 60);

      if (hours > 24) {
        localStorage.removeItem("barberAuthenticated");
        localStorage.removeItem("barberLoginTime");
        window.location.hash = "";
        window.location.reload();
      }
    };

    checkAuthExpiry();
    const interval = setInterval(checkAuthExpiry, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ================= BARBERS LOAD ================= */

  useEffect(() => {
    if (showAdmin) return;

    fetch("/api/barbers")
      .then(res => res.json())
      .then(data => {
        console.log("📥 BARBERS:", data);
        setBarbers(data);
      })
      .catch(err => {
        console.error("❌ API error:", err);
      });
  }, [showAdmin]);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("barberAuthenticated");
    localStorage.removeItem("barberLoginTime");
    setShowAdmin(false);
    window.location.hash = "";
    window.location.reload();
  };

  /* ================= RENDER ================= */

  if (showAdmin) {
    return <BarberAdmin onLogout={handleLogout} />;
  }

  return (
    <>
      <Header />
      <Hero />

      <Barbers
        barbers={barbers}
        onSelect={setSelectedBarber}
      />

      <Gallery />

      <Footer />

      <BookingSheet
        open={!!selectedBarber}
        barber={selectedBarber}
        onClose={() => setSelectedBarber(null)}
      />
    </>
  );
}

      {/* Скрытая кнопка для дебага
      <div style={{ 
        
      }}>
        Hash: {window.location.hash}<br />
        Auth: {localStorage.getItem("barberAuthenticated") || 'false'}
      </div> */}
