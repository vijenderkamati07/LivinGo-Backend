const path = require("path");

//Local Module
const Home = require("../Models/home");
const User = require("../Models/user");

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

exports.postAddToFavorites = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(req.session.user._id);
  if (!user.favouriteHomes.includes(homeId)) {
    user.favouriteHomes.push(homeId);
    await user.save();
  }
  res.redirect("/favourite");
};

exports.postDelFromFavorites = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;

  const user = await User.findById(userId);

  if (user.favouriteHomes.includes(homeId)) {
    user.favouriteHomes.pull(homeId);
    await user.save();
  }

  res.redirect("/favourite");
};

exports.getFavorites = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favouriteHomes");
  res.render("store/favourite-list", {
    favHomesDetails: user.favouriteHomes,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
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
