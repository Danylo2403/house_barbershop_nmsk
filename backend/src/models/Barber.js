// backend/models/Barber.js
import mongoose from "mongoose";

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Сурен", "Ануш", "Крістіна"],
    required: true,
  },
  workStart: {
    type: String,
    default: "09:00"
  },
  workEnd: {
    type: String,
    default: "19:00"
  },
  serviceDuration: {
    type: Number,
    default: 60
  },
  color: {
    type: String,
    default: "#4CAF50"
  }
});

export default mongoose.model("Barber", barberSchema);