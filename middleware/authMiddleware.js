import dotenv from "dotenv";
dotenv.config();
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function checkAuth(req, res, next) {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
  if (!token) return next(new AppError("No token provided", 401));
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new AppError("Invalid token", 401));
  }
}

export function checkRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
}

export const protect = checkAuth;
