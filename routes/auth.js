import express from "express";
import {
  loginController,
  protectedController,
  adminController,
} from "../controllers/authController.js";
import { signupController } from "../controllers/authController.js";
import { checkAuth, checkRole, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Login route
router.post("/login", loginController);

// Signup route
router.post("/signup", signupController);

// Check if user is authenticated
router.get("/check-auth", checkAuth, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

//logout route
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.user = null;
  res.json({ message: "Logged out successfully", status: "success" });
});

export default router;
