import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { checkAuth, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require admin role
router.use(checkAuth, checkRole("admin"));

// User CRUD
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
