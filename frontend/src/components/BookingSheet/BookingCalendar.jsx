export default function BookingCalendar({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid #ccc",
        fontSize: "16px"
      }}
    />
  );
}