import express from "express";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";
import {
  getReservations,
  getReservation,
  deleteReservation,
  updateReservationStatus,
} from "../controllers/reservationController.js";

const router = express.Router();

router.use(checkAuth, checkRole("admin"));

router.get("/reservations", getReservations);
router.get("/reservations/:id", getReservation);
router.delete("/reservations/:id", deleteReservation);
router.patch("/reservations/:id/status", updateReservationStatus);

export default router;
