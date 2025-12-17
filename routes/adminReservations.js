import express from "express";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";
import {
  getReservations,
  getReservation,
  deleteReservation,
  updateReservationStatus,
  updateReservationNote,
  getReservationNote,
  updateReservationSummary,
  getReservationSummary,
} from "../controllers/reservationController.js";

const router = express.Router();

router.use(checkAuth, checkRole("admin"));

router.get("/reservations", getReservations);
router.get("/reservations/:id", getReservation);
router.delete("/reservations/:id", deleteReservation);
router.patch("/reservations/:id/status", updateReservationStatus);
router.patch("/reservations/:id/note", updateReservationNote);
router.get("/reservations/:id/note", getReservationNote);
router.patch("/reservations/:id/summary", updateReservationSummary);
router.get("/reservations/:id/summary", getReservationSummary);

export default router;
