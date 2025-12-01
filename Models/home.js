const mongoose = require('mongoose');

const Favourite = require('./favorate');
const getCoordinates = require('./coordinates');

const homeSchema = mongoose.Schema({
  houseName:{
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  },
  location:{
    type: String,
    required: true
  },
  photo:String,
  description:String,
  lat: Number,
  lng: Number,
  category: String
});

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

homeSchema.pre('findOneAndDelete', async function(next){
  const homeId = this.getQuery().id;
  await Favourite.deleteMany({homeId:homeId});
})

module.exports = mongoose.model('Home',homeSchema);