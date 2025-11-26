import dotenv from "dotenv";
dotenv.config();
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { checkAuth, checkRole, protect } from "../middleware/authMiddleware.js";

export async function signupController(req, res, next) {
  const { username, password, email, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return next(new AppError("Username already exists", 400));
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role });
    await user.save();
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function loginController(req, res, next) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return next(new AppError("Invalid credentials", 401));
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return next(new AppError("Invalid credentials", 401));
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
    });
    res.json({ message: "Logged in", token });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

export function protectedController(req, res) {
  res.json({ message: "You are authenticated", user: req.user });
}

export function adminController(req, res) {
  res.json({ message: "You are admin", user: req.user });
}

export { checkAuth, checkRole, protect };
