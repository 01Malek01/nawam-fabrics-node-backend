import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    quantityMeters: { type: String },
    customerAddress: { type: String, required: true },
    productRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    Images: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    chatSummary: { type: String },
    note: { type: String },
    items: [
      {
        Images: [{ type: String }],
        productRecordId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantityMeters: { type: String, required: true },
      },
    ],
    isCartReservation: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
