import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    quantityMeters: { type: String, required: true },
    customerAddress: { type: String, required: true },
    productRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
  },
  { timestamps: true }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
