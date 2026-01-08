export default function BarberCard({ barber, onClick }) {
  return (
    <div className="barber-card" onClick={onClick}>
      <img src={barber.photo} alt={barber.name} />
      <h3>{barber.name}</h3>
      <p>{barber.specialty}</p>
    </div>
  );
}
