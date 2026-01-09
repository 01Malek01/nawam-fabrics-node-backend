import express from "express";
import {
  createReservation,
  createCartReservation,
} from "../controllers/reservationController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to create reservation
router.post("/", createReservation);
router.post("/cartReservation", checkAuth, createCartReservation);

export default router;
