const path = require("path");

//Local Module
const Home = require("../Models/home");
const User = require("../Models/user");

//Done
exports.getIndex = async (req, res, next) => {
  try {
    const homes = await Home.find();
    if (!homes) {
      return res.status(404).json({ message: "No homes found" });
    }
    res.status(200).json(homes);
  } catch (err) {
    console.error("Error fetching homes:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ✅ ADD TO FAVOURITES (API)
exports.postAddToFavorites = async (req, res) => {
  // guard: must be logged in
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const homeId = req.body.homeId;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // avoid duplicates
    const alreadyFav = user.favouriteHomes.some(
      (id) => id.toString() === homeId
    );

    if (!alreadyFav) {
      user.favouriteHomes.push(homeId);
      await user.save();
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error adding favourite:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add to favourites" });
  }
};

// ✅ REMOVE FROM FAVOURITES (API)
exports.postDelFromFavorites = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const homeId = req.params.homeId;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.favouriteHomes = user.favouriteHomes.filter(
      (hId) => hId.toString() !== homeId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Home removed from favourites",
    });
  } catch (err) {
    console.error("Error removing favourite:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove favourite" });
  }
};

// ✅ GET FAVOURITES LIST (API)
exports.getFavorites = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId).populate("favouriteHomes");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.favouriteHomes);
  } catch (err) {
    console.error("Error fetching favourites:", err);
    return res.status(500).json({ message: "Failed to fetch favourites" });
  }
};

//Done
exports.getHomeDetails = async (req, res) => {
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
