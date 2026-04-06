//Core Module
const path = require("path");

//External Module
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenev = require("dotenv").config();
const mongoDbStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const cors = require("cors");

//Local Modules
const mainDir = require("./utils/pathUtil");
const { error } = require("./Controller/error");
const apiRouter = require("./router/apiRouter");

const app = express();

const store = new mongoDbStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// (optional but useful) log store errors
store.on("error", (err) => {
  console.error("Session store error:", err);
});

const randomStr = (length) => {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const strorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(mainDir, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, randomStr(5) + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = multer({
  storage: strorage,
  fileFilter: fileFilter,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS for frontend origins
app.use(
  cors({
    origin: ["http://localhost:5173", "https://livingo-six.vercel.app"],
    credentials: true,
  })
);

// trust proxy so secure cookies work on Render
app.set("trust proxy", 1);

app.use(multer(multerOptions).single("photo"));
app.use(express.static(path.join(mainDir, "public")));
app.use("/uploads", express.static(path.join(mainDir, "uploads")));
app.use("/host/uploads", express.static(path.join(mainDir, "uploads")));

app.use(
  session({
    secret: "...",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use("/api", apiRouter);

app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use(error);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connected..");
    app.listen(process.env.PORT, () => {
      console.log("Try to connect with server..");
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("error while conecting..", err);
  });
