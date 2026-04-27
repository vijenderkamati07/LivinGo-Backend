//Local Module
const Booking = require('../Models/bookings');
const {createBookingService, cancelBookingService, getUserBookingsService, getHostBookingsService} = require('../Services/bookingService');

exports.createBooking = async (req, res, next)=>{

  try{
    const { homeId, startDate, endDate, person } = req.body;

    const booking = await createBookingService(
      req.user.userId,
      homeId,
      startDate,
      endDate,
      person
    );

    res.status(201).json(
      {
        success: true,
        data: booking
      }
    )

  }catch(err){
    next(err);
  }
};

exports.cancelBooking = async (req, res, next)=>{

  try{
    const booking = await cancelBookingService(
      req.user.userId,
      req.params.bookingId
    );

    res.status(200).json(
      {
       success: true,
       data: booking
      }
    );

  }catch(err){
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await getUserBookingsService(req.user.userId);

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (err) {
    next(err);
  }
};

exports.getHostBookings = async (req, res, next) => {
  const bookings = await getHostBookingsService(req.user.userId);
  if(!bookings){
    res.status(404).json(
      {message: "You did not have any Bookings right now"}
    )
  }
  res.status(200).json({
    success: true,
    data:bookings
  })
};