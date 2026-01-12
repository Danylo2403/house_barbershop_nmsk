import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const createBooking = data =>
  API.post("/bookings", data);

export const getBarbers = () =>
  API.get("/barbers");

export default API;
