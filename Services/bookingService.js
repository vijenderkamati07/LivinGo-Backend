const mongoose = require('mongoose');
const Home = require('../Models/home');
const Booking = require('../Models/bookings');

exports.createBookingService = async(userId, homeId, startDate, endDate) => {

  const start = new Date(startDate);
  const end = new Date(endDate);

  // VAlidate format
  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid date format");
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  // Validate logic
  if (start >= end) {
    throw new Error("Invalid date range");
  }

  if (start < today) {
    throw new Error("Cannot book past dates");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const home = await Home.findById(homeId).session(session);
    if (!home) throw new Error("Home not found");

    if (home.userId.toString() === userId.toString()) {
      throw new Error("You cannot book your own home");
    }

    // Price calculation
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (nights <= 0) throw new Error("Invalid stay duration");

    const totalPrice = nights * home.price;

    // Conflict check
    const conflict = await Booking.findOne({
      homeId,
      status: { $ne: "cancelled" },
      startDate: { $lt: end },
      endDate: { $gt: start }
    }).session(session);

    if (conflict) {
      throw new Error("Dates already booked");
    }

    const hostId = home.userId;

    // Create booking
    const booking = await Booking.create([{
      userId,
      homeId,
      hostId: hostId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "confirmed"
    }], { session });

    await session.commitTransaction();
    return booking[0];

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

exports.cancelBookingService = async (userId, bookingId) =>{

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking not found for ID: ${bookingId}`);
    }

    if(booking.userId.toString()!==userId.toString()){
      throw new Error("Unauthorized");
    }

    if(booking.status==='cancelled'){
      throw new Error("Booking already Cancelled");
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    if(booking.startDate<today){
      throw new Error("You cannot cancel past bookings");
    }

    booking.status = 'cancelled';
    await booking.save();

    return booking;

  
};

exports.getUserBookingsService = async (userId) => {
  return await Booking.find({ userId })
    .populate('homeId')
    .sort({ createdAt: -1 });
};

exports.getHostBookingsService = async (hostId) => {
  return await Booking.find({ hostId })
    .populate('homeId')
    .populate('userId')
    .sort({ createdAt: -1 });
};
