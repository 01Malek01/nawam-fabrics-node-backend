import express from "express";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { imageTransformMiddleware } from "../middleware/imageTransformMiddleware.js";
import {
  createLastPiece,
  getLastPieces,
  getLastPiece,
  updateLastPiece,
  deleteLastPiece,
} from "../controllers/lastPieceController.js";

const router = express.Router();

// All routes require admin role
router.use(checkAuth, checkRole("admin"));

router.post(
  "/lastpieces",
  upload.array("Image"),
  imageTransformMiddleware,
  createLastPiece
);
router.get("/lastpieces", getLastPieces);
router.get("/lastpieces/:id", getLastPiece);
router.put(
  "/lastpieces/:id",
  upload.array("Image"),
  imageTransformMiddleware,
  updateLastPiece
);
router.delete("/lastpieces/:id", deleteLastPiece);

export default router;
