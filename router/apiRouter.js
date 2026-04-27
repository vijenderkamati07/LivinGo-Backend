const express = require('express');

//Local Modules
const {isAuth} = require("../Middleware/authMidle");
const isHost = require("../Middleware/isHost");
const { getIndex, getHomeDetails, getFavorites, postDelFromFavorites, postAddToFavorites, getListedHomes} = require('../Controller/storeController');
const { postSignup, postLogin, postLogout, getMe} = require('../Controller/authController');
const {getHostHomes, postAddHome, postEditHomes, getHomeForEdit, getEditHomes, postDeletetHome}= require('../Controller/hostController');

const { createBooking, cancelBooking, getMyBookings, getHostBookings } = require('../Controller/bookingController');

const apiRouter = express.Router();

// User routers
apiRouter.get("/homes", getIndex); // return all homes
apiRouter.get("/homes/:homeId", getHomeDetails); // return home details by ID
apiRouter.get("/listed-homes", getListedHomes)//Return serached, filterd and sort homes

//User Favourites routers
apiRouter.get("/favourites", isAuth, getFavorites); // return favourite homes
apiRouter.post("/favourite", isAuth, postAddToFavorites ); // add home to favourites
apiRouter.delete("/favourite/:homeId", isAuth, postDelFromFavorites ); // remove home from favourites


//Auth routers
apiRouter.post("/auth/signup", postSignup); // user signup
apiRouter.post("/auth/login", postLogin); // user login
apiRouter.post("/auth/logout", postLogout)
apiRouter.get("/auth/me", getMe); // get current logged in user


//Host routers
apiRouter.get("/host/host-homes",isAuth, isHost, getHostHomes); // return host homes
apiRouter.post("/host/add-home", isAuth, isHost, postAddHome); // add new home
apiRouter.get("/host/edit-home/:homeId",isAuth, isHost, getEditHomes); // get home details for editing
apiRouter.post("/host/edit-home/:homeId", isAuth, isHost, postEditHomes); // edit existing home
apiRouter.post("/host/delete-home/:homeId",isAuth, isHost, postDeletetHome); // delete existing home
apiRouter.get("/host/host-bookings", isAuth, isHost, getHostBookings);


//Booking routers
apiRouter.get("/my-bookings", isAuth, getMyBookings);
apiRouter.post("/create-booking", isAuth, createBooking);
apiRouter.patch("/bookings/:bookingId/cancel", isAuth, cancelBooking);


module.exports = apiRouter;
