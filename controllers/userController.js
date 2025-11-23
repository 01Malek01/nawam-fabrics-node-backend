import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// Get all users
export async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Get single user
export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found", 404));
    res.json(user);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Create user
export async function createUser(req, res) {
  try {
    const { username, password, role, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role, email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const { username, password, role, email } = req.body;
    const update = { username, role, email };
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!user) return next(new AppError("User not found", 404));
    res.json(user);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError("User not found", 404));
    res.json({ message: "User deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}
