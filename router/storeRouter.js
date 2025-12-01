//External Module
const express = require('express');

//Local Module
const {getHomes, getHomeDetails, postAddToFavorites, postDelFromFavorites} = require('../Controller/storeController')
const {getBookings} = require('../Controller/storeController')
const {getFavorites} = require('../Controller/storeController')
const {getIndex} = require('../Controller/storeController')

const userRouter = express.Router();

userRouter.get("/", getIndex);
userRouter.get("/homes", getHomes);
userRouter.get("/bookings", getBookings);
userRouter.get("/favourite", getFavorites);
userRouter.get("/home/:homeId", getHomeDetails);
userRouter.post("/favourite", postAddToFavorites);
userRouter.post("/favourite/delete/:homeId", postDelFromFavorites);

module.exports = userRouter;