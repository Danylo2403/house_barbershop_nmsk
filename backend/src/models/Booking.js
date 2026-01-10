// backend/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barber",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    clientName: {
      type: String,
      required: true,
      default: "Клієнт"
    },
    services: [{
      type: String
    }],
    notified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);