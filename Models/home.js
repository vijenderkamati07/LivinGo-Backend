//External Modules
const mongoose = require('mongoose');

//Local Modules
const getCoordinates = require('./coordinates');

const homeSchema = mongoose.Schema({
  houseName: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  state: {type: String, required: true},
  photo: String,
  description: String,
  lat: Number,
  lng: Number,
  category: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},{ timestamps: true });


homeSchema.pre('save', async function () {
  const result = await getCoordinates(this.location);

  if (result) {
    this.lat = result.lat;
    this.lng = result.lng;  
  }else{
    this.lat = null;
    this.lng = null;  
  }
});

module.exports = mongoose.model('Home',homeSchema);