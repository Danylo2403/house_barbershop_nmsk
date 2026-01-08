import { useEffect, useState } from "react";
import BookingSheet from "../BookingSheet/BookingSheet";
import "./Barbers.css";

export default function Barbers() {
  const [barbers, setBarbers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/barbers")
      .then((res) => res.json())
      .then((data) => {
        setBarbers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Завантаження барберів...</p>;
  }

  if (!barbers.length) {
    return <p style={{ textAlign: "center" }}>Барбери не завантажені</p>;
  }

  return (
    <>
      <section className="barbers">
        {barbers.map((b) => (
          <div className="barber-card" key={b._id}>
            <img
              src={b.photo}
              alt={b.name}
              className="barber-photo"
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
              }}
            />
            <h3>{b.name}</h3>
            <p>{b.specialty}</p>
            {/* <p>{b.experience} </p> */}
            <button onClick={() => setSelected(b)}>
              Записатись
            </button>
          </div>
        ))}
      </section>

      {selected && (
        <BookingSheet
          open={true}
          barber={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}