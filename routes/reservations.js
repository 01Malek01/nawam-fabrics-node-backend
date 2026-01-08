import express from "express";
import {
  createReservation,
  createCartReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

// Public route to create reservation
router.post("/", createReservation);
router.post("/cartReservation", createCartReservation);

export default router;
