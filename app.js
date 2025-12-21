import publicRoutes from "./routes/public.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import adminProductRoutes from "./routes/adminProduct.js";
import adminCategoryRoutes from "./routes/adminCategory.js";
import reservationRoutes from "./routes/reservations.js";
import adminReservationRoutes from "./routes/adminReservations.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://elnawamfabrics.com",
      "https://elnawamfabrics.com/",
    ],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminProductRoutes);
app.use("/api/admin", adminCategoryRoutes);
app.use("/api/admin", adminReservationRoutes);
app.use("/api", publicRoutes);
app.use("/api/reservations", reservationRoutes);

// Global error handler
app.use(globalErrorHandler);
export default app;
