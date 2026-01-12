import "./Barbers.css";

export default function Barbers({ barbers = [], onSelect }) {
  console.log("Получил барберов:", barbers?.length || 0);
  
  if (!barbers || barbers.length === 0) {
    return <p style={{ textAlign: "center" }}>Барбери не завантажені</p>;
  }

  return (
    <section className="barbers">
      {barbers.map((barber) => (
        <div className="barber-card" key={barber._id}>
          <img
            src={barber.photo}
            alt={barber.name}
            className="barber-photo"
          />
          <h3>{barber.name}</h3>
          <p>{barber.specialty}</p>
          <button onClick={() => onSelect(barber)}>
            Записатись
          </button>
        </div>
      ))}
    </section>
  );
}