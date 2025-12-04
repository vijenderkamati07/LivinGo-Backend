const path = require("path");

//Local Module
const Home = require("../Models/home");
const User = require("../Models/user");

//Done
exports.getIndex = async (req, res, next) => {
  const homes = await Home.find();
  if (!homes) {
    return res.status(404).json({ message: "No homes found" });
  }
  res.status(200).json(homes);
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
  const homeId = req.body.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favouriteHomes.includes(homeId)) {
    user.favouriteHomes.push(homeId);
    const result = await user.save();
    if (!result) {
      return res.status(500).json({ sucess: false, message: "Failed to add to favourites" });
    }
  }
  return res.status(200).json({sucess: true, message: "Home added to favourites" });
};

//Done
exports.postDelFromFavorites = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ status: flase, message: "User not found" });
  }
  user.favouriteHomes = user.favouriteHomes.filter(
    (hId) => hId.toString() !== homeId
  );
  await user.save();
  return res.status(200).json({ status: true, message: "Home removed from favourites" });
};

//Done
exports.getFavorites = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favouriteHomes");
  if (!user) {
    return res.status(404).json({  message: "User not found" });
  } else {
    return res.status(200).json(user.favouriteHomes);
  }
};
//Done
exports.getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    const response = {
      _id: home._id,
      houseName: home.houseName,
      price: home.price,
      location: home.location,
      state: home.state,
      photo: [home.photo, home.photo, home.photo, home.photo, home.photo],
      description: home.description,
      category: home.category,
      lat: home.lat || 28.6448,
      lng: home.lng || 77.216,

      amenities: [
        "Free Wi-Fi",
        "Air Conditioning",
        "Smart TV",
        "Power Backup",
        "Hot Water",
        "Kitchen Access",
        "Parking Available",
        "Pet Friendly",
        "24/7 Security",
      ],

      reviews: [
        { name: "Ujjwal", review: "Amazing stay! Clean rooms and fast Wi-Fi." },
        {
          name: "Ashwani",
          review: "Loved the cozy interior. Will return soon!",
        },
        {
          name: "Rupan",
          review: "Perfect for families — peaceful and spacious.",
        },
        { name: "Rohit", review: "Quick check-in process and polite host." },
      ],

      host: {
        name: "Manish Singh",
        bio: "Hosting since 2022 • English & Hindi",
        responseRate: 98,
        isSuperhost: true,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching home details:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
