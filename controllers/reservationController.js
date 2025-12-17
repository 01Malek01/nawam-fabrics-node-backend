import Reservation from "../models/Reservation.js";
import AppError from "../utils/AppError.js";

// Public: create a reservation (images come as array of URLs in body)
export async function createReservation(req, res, next) {
  try {
    const body = req.body;

    // Validation
    if (!body.customerName || String(body.customerName).trim().length < 2) {
      return next(new AppError("الاسم يجب أن يكون على الأقل حرفين", 400));
    }
    const phoneRe = /^\+?[0-9\s-]{10,}$/;
    if (!body.customerPhone || !phoneRe.test(String(body.customerPhone))) {
      return next(new AppError("رقم الهاتف غير صالح", 400));
    }
    if (!body.quantityMeters || String(body.quantityMeters).trim().length < 1) {
      return next(new AppError("الكمية مطلوبة، ولا يمكن أن تكون فارغة", 400));
    }
    if (
      !body.customerAddress ||
      String(body.customerAddress).trim().length < 5
    ) {
      return next(new AppError("العنوان يجب أن يكون على الأقل 5 أحرف", 400));
    }
    if (
      !body.productRecordId ||
      String(body.productRecordId).trim().length < 1
    ) {
      return next(new AppError("المنتج يجب أن يكون على الأقل 1 حرف", 400));
    }
    if (!Array.isArray(body.Images) || body.Images.length < 1) {
      return next(new AppError("يجب اختيار صورة واحدة على الأقل", 400));
    }

    const reservation = new Reservation({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      quantityMeters: body.quantityMeters,
      customerAddress: body.customerAddress,
      productRecordId: body.productRecordId,
      Images: body.Images,
      note: body.note,
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: get all reservations
export async function getReservations(req, res, next) {
  try {
    const reservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .populate("productRecordId");
    res.json(reservations);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: get single reservation
export async function getReservation(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json(reservation);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: delete reservation
export async function deleteReservation(req, res, next) {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json({ message: "Reservation deleted" });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: update reservation status
export async function updateReservationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled"];
    if (!status || !allowed.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json(reservation);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: update reservation note
export async function updateReservationNote(req, res, next) {
  try {
    const { note } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { note },
      { new: true }
    );
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json(reservation);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: get reservation note
export async function getReservationNote(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id).select(
      "note"
    );
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json({ note: reservation.note });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: update chat summary
export async function updateReservationSummary(req, res, next) {
  try {
    const { summary } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { chatSummary: summary },
      { new: true }
    );
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json(reservation);
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}

// Admin: get chat summary
export async function getReservationSummary(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id).select(
      "chatSummary"
    );
    if (!reservation) return next(new AppError("Reservation not found", 404));
    res.json({ summary: reservation.chatSummary });
  } catch (err) {
    next(new AppError(err.message || "Server error", 500));
  }
}
