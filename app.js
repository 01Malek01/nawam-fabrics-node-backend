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
import cartRoutes from "./routes/cart.js";
import adminReservationRoutes from "./routes/adminReservations.js";
import adminLastPieceRoutes from "./routes/adminLastPiece.js";
import lastPiecePublicRoutes from "./routes/lastPiecePublic.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

//in production it's handled by nginx
if (process.env.NODE_ENV !== "production") {
  app.use(
    // Use a whitelist and reflect the request origin when allowed.
    // Important: when credentials are included, the Access-Control-Allow-Origin
    // header must be a specific origin (not '*').
    (() => {
      const whitelist = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://elnawamfabrics.com",
        "https://www.elnawamfabrics.com",
      ];
      return cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (e.g., server-to-server, curl)
          if (!origin) return callback(null, true);
          if (whitelist.indexOf(origin) !== -1) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"), false);
        },
        credentials: true,
      });
    })()
  );
}

// Cleanup CORS header: if multiple values are present combine/replace
// to ensure only a single, specific origin is returned (required when credentials=true).
// app.use((req, res, next) => {
//   const header = res.getHeader("Access-Control-Allow-Origin");
//   if (!header) return next();

//   const whitelist = [
//     // "http://localhost:5173",
//     // "http://localhost:3000",
//     "https://elnawamfabrics.com",
//     "https://www.elnawamfabrics.com",
//   ];

//   const originHeader = req.headers.origin;

//   let chosen = header;
//   // Normalize to array
//   const values = Array.isArray(header)
//     ? header
//     : String(header)
//         .split(",")
//         .map((v) => v.trim());
//   // Prefer the request origin if present in values and whitelist
//   if (
//     originHeader &&
//     values.indexOf(originHeader) !== -1 &&
//     whitelist.indexOf(originHeader) !== -1
//   ) {
//     chosen = originHeader;
//   } else {
//     // Otherwise pick the first value that is not '*', or fallback to the first value
//     chosen = values.find((v) => v !== "*") || values[0];
//   }

//   if (chosen) {
//     res.setHeader("Access-Control-Allow-Origin", chosen);
//   }
//   next();
// });
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
app.use("/api/admin", adminLastPieceRoutes);
app.use("/api", publicRoutes);
app.use("/api", lastPiecePublicRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/cart", cartRoutes);

// Global error handler
app.use(globalErrorHandler);
export default app;
