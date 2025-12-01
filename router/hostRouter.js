//External Module
const express = require('express');

//Local Module
const {getAddHome, getHostHomes, getEditHomes, postAddHome,postEditHomes, postDeletetHome} = require('../Controller/hostController');


const hostRouter = express.Router();

hostRouter.get("/add-home", getAddHome);
hostRouter.post("/add-home",postAddHome);
hostRouter.get("/host-home-list",getHostHomes);
hostRouter.get("/edit/:homeId",getEditHomes);
hostRouter.post("/edit",postEditHomes);
hostRouter.post("/delete/:homeId",postDeletetHome);

exports.hostRouter = hostRouter;