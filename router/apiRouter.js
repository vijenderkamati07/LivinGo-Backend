const express = require('express');

const { getIndex, getHomeDetails, getFavorites, postDelFromFavorites, postAddToFavorites} = require('../Controller/storeController');

const { postSignup, postLogin, postLogout, getMe} = require('../Controller/authController');

const {getHostHomes, postAddHome, postEditHomes, getHomeForEdit, getEditHomes, postDeletetHome}= require('../Controller/hostController');

const apiRouter = express.Router();

// User routers
apiRouter.get("/homes", getIndex); // return all homes
apiRouter.get("/homes/:homeId", getHomeDetails); // return home details by ID

//User Favourites routers
apiRouter.get("/favourites", getFavorites); // return favourite homes
apiRouter.post("/favourite", postAddToFavorites ); // add home to favourites
apiRouter.delete("/favourite/:homeId", postDelFromFavorites ); // remove home from favourites


//Auth routers
apiRouter.post("/auth/signup", postSignup); // user signup
apiRouter.post("/auth/login", postLogin); // user login
apiRouter.post("/auth/logout", postLogout)
apiRouter.get("/auth/me", getMe); // get current logged in user


//Host routers
apiRouter.get("/host/host-homes",getHostHomes); // return host homes
apiRouter.post("/host/add-home", postAddHome); // add new home
apiRouter.get("/host/edit-home/:homeId", getEditHomes); // get home details for editing
apiRouter.post("/host/edit-home/:homeId", postEditHomes); // edit existing home
apiRouter.post("/host/delete-home/:homeId", postDeletetHome); // delete existing home



module.exports = apiRouter;
