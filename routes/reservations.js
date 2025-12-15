import express from "express";
import { createReservation } from "../controllers/reservationController.js";

const router = express.Router();

// Public route to create reservation
router.post("/", createReservation);

export default router;
