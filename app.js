//Core Module
const path = require('path');

//External Module
const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const dotenev = require("dotenv").config();
const mongoDbStore = require('connect-mongodb-session')(session);


//Local Modules
const storeRouter = require('./router/storeRouter');
const {hostRouter} = require('./router/hostRouter');
const mainDir = require('./utils/pathUtil');
const {error} = require('./Controller/error');
const authRouter = require('./router/authRouter');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new mongoDbStore({
  uri:process.env.MONGO_URI,
  collection:'sessions'
});

app.use(express.static(path.join(mainDir, 'public')))

app.use(express.urlencoded());

app.use(session({
  secret:'my secret key',
  resave:false,
  saveUninitialized:true,
  store:store
}));

app.use((req, res, next)=>{
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next)=>{
  if(req.isLoggedIn){
    next();
  }else{
    res.redirect("/login");
  }
});
app.use("/host",hostRouter);

console.log("hi");

app.use(error)

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("Mongo connected..");
  app.listen(process.env.PORT, () => {
    console.log("Try to connect with server..");
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}).catch(err=>{
  console.log("error while conecting..")
}
);
