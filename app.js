//Core Module
const path = require("path");

//External Module
const express = require("express");
const mongoose = require("mongoose");
const dotenev = require("dotenv").config();
const cookieParser = require("cookie-parser");
const multer = require("multer");
const cors = require("cors");

//Local Modules
const mainDir = require("./utils/pathUtil");
const { error } = require("./Controller/error");
const apiRouter = require("./router/apiRouter");

const app = express();

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

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS for frontend origins
app.use(
  cors({
    origin: ["http://localhost:3000", "https://livingo-six.vercel.app"],
    credentials: true,
  })
);

// trust proxy so secure cookies work on Render
app.set("trust proxy", 1);

app.use(multer(multerOptions).single("photo"));
app.use(express.static(path.join(mainDir, "public")));
app.use("/uploads", express.static(path.join(mainDir, "uploads")));
app.use("/host/uploads", express.static(path.join(mainDir, "uploads")));

app.use("/api", apiRouter);

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
