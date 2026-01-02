import express from "express";
import {
  getLastPieces,
  getLastPiece,
} from "../controllers/lastPieceController.js";

const router = express.Router();

router.get("/lastpieces", getLastPieces);
router.get("/lastpieces/:id", getLastPiece);

export default router;
