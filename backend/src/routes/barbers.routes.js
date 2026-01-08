import express from "express";
import Barber from "../models/Barber.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const barbers = await Barber.find();
    res.json(barbers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;