import mongoose from "mongoose";

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Сурен", "Ануш", "Кристіна"],
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
});

export default mongoose.model("Barber", barberSchema);