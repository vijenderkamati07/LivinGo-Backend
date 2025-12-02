const path = require("path");

//Local Module
const mainDir = require("../utils/pathUtil");
const Home = require("../Models/home");
const Favourite = require("../Models/favorate");

exports.getIndex = (req, res, next) => {
  Home.find().then((homes) => {
    res.render("store/index", {
      homes: homes,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((homes) => {
    res.render("store/home-list", {
      homes: homes,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    isLoggedIn: req.isLoggedIn,
      user: req.session.user,
  });
};

exports.postAddToFavorites = (req, res, next) => {
  const homeId = req.body.id;

  Favourite.findOne({ homeId: homeId })
    .then((fav) => {
      if (fav) {
        console.log("Already marked as fav");
      } else {
        fav = new Favourite({ homeId: homeId });
        fav.save().then((result) => {
          console.log("Home marked to fav ", result);
        });
      }
    })
    .catch((err) => {
      console.log("Error while marking as fav", err);
    })
    .finally(res.redirect("/favourite"));
};

exports.postDelFromFavorites = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Try to Remove from Fav with home id : ", homeId);
  Favourite.findOneAndDelete(homeId)
    .then(() => {
      res.redirect("/favourite");
    })
    .catch((err) => {
      if (err) {
        console.log("Error occure while Removing..");
      }
    });
};

exports.getFavorites = (req, res, next) => {
  Favourite.find()
    .populate("homeId")
    .then((favourites) => {
      const favHomesDetails = favourites.map((fav) => fav.homeId);
      console.log(favHomesDetails);
      res.render("store/favourite-list", {
        favHomesDetails: favHomesDetails,
        isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      });
    });
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findById(homeId).then((home) => {
    if (!home) {
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};
