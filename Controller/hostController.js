//Core Module
const path = require("path");

//Local Module
const mainDir = require("../utils/pathUtil");
const Home = require("../Models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHomes = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("home not found for editing");
      return res.redirect("host/host-home-list");
    }
    console.log(home);
    res.render("host/edit-home", {
      home: home,
      isLoggedIn: req.isLoggedIn,
      editing: editing,
      user: req.session.user,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, photo, description, category } = req.body;

  const house = new Home({
    houseName,
    price,
    location,
    photo,
    description,
    category,
  });
  house.save();
  res.redirect("/host/host-home-list");
};

exports.getHostHomes = (req, res, next) => {
  Home.find()
    .then((houses) => {
      res.render("host/host-home-list", {
        houses: houses,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error("ERROR in Home.find:", err);
    });
};

exports.postEditHomes = (req, res, next) => {
  const { id, houseName, price, location, photo, description, category } =
    req.body;
  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.photo = photo;
      home.description = description;
      home.category = category;

      home
        .save()
        .then((result) => {
          console.log("Home Updated: ", result);
        })
        .catch((err) => {
          console.log("Error while updating", err);
        });
    })
    .catch((err) => {
      console.log("Home not found", err);
    });
  res.redirect("/host/host-home-list");
};

exports.postDeletetHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Try to delete home id : ", homeId);

  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      if (err) {
        console.log("Error occure while Removing..", err);
      }
    });
};
