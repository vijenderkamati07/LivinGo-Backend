//External Modules
const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startDate: { type: Date, required: true },
  endDate: {type: Date, required: true},
  totalPrice: {type: Number, required: true},
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
},{ timestamps: true });

bookingSchema.index({ homeId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking',bookingSchema);