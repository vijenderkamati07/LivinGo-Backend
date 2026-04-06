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

//Done
exports.postAddToFavorites = async (req, res) => {
  
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

//Done
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

//Done
exports.getFavorites = async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId).populate("favouriteHomes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.favouriteHomes || []);
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

//Done
exports.getListedHomes = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      sort = "recent",
      state,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const filter = {};

    if (search && search.trim()) {
  const regex = new RegExp(search.trim(), "i");
  filter.$or = [
    { title: regex },
    { location: regex },
    { city: regex },
    { state: regex },
    { category: regex },
  ];
}

    if (state && state !== "all") {
      filter.state = state;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const priceFilter = {};
    if (minPrice) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice) {
      priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }
    
    let sortStage = { createdAt: -1 };
    if (sort === "price_asc") sortStage = { price: 1 };
    if (sort === "price_desc") sortStage = { price: -1 };
    if (sort === "recent") sortStage = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const docs = await Home.find(filter)
      .sort(sortStage)
      .skip(skip)
      .limit(limit + 1);

    const hasMore = docs.length > limit;
    const homes = hasMore ? docs.slice(0, limit) : docs;

    return res.json({
      homes,
      hasMore,
    });
  } catch (err) {
    console.error("Error in getListedHomes:", err);
    res.status(500).json({ message: "Failed to fetch homes" });
  }
};
