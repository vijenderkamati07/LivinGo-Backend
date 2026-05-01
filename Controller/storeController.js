const path = require("path");

//Local Module
const Home = require("../Models/home");
const User = require("../Models/user");

exports.getIndex = async (req, res) => {
  try {
    const homes = await Home.find();

    if (!homes || homes.length === 0) {
      return res.status(404).json({ message: "No homes found" });
    }

    return res.status(200).json(homes);

  } catch (err) {
    console.error("Error fetching homes:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.postAddToFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { homeId } = req.body;

    if (!homeId) {
      return res.status(400).json({ message: "Home ID required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // prevent duplicates
    if (user.favouriteHomes.includes(homeId)) {
      return res.status(200).json({ message: "Already in favourites" });
    }

    user.favouriteHomes.push(homeId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Added to favourites",
    });
  } catch (err) {
    console.error("Add to favourites error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.postDelFromFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { homeId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favouriteHomes = user.favouriteHomes.filter(
      (id) => id.toString() !== homeId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Removed from favourites",
    });
  } catch (err) {
    console.error("Remove favourite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate("favouriteHomes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.favouriteHomes);
  } catch (err) {
    console.error("Get favourites error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getHomeDetails = async (req, res) => {
  try {
    const homeId = req.params.homeId;

    const home = await Home.findById(homeId)
                .populate("userId", "firstName email");

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
        { name: "Ujjwal", review: "Amazing stay!" },
        { name: "Ashwani", review: "Loved it!" },
        { name: "Rupan", review: "Perfect stay" },
        { name: "Rohit", review: "Smooth experience" },
      ],

      host: {
        name: home.userId.firstName,
        bio: "Hosting since 2022",
        responseRate: 98,
        isSuperhost: true,
      },
    };
    console.log("POPULATED USER:", home.userId);

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching home details:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

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

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { houseName: regex },
        { location: regex },
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
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length) {
      filter.price = priceFilter;
    }

    let sortStage = { createdAt: -1 };
    if (sort === "price_asc") sortStage = { price: 1 };
    if (sort === "price_desc") sortStage = { price: -1 };

    const skip = (page - 1) * limit;

    const docs = await Home.find(filter)
      .sort(sortStage)
      .skip(skip)
      .limit(limit + 1);

    const hasMore = docs.length > limit;
    const homes = hasMore ? docs.slice(0, limit) : docs;

    return res.json({ homes, hasMore });

  } catch (err) {
    console.error("Error in getListedHomes:", err);
    return res.status(500).json({ message: "Failed to fetch homes" });
  }
};

exports.getProfile = async (req, res) => {

    try{
      const userId = req.user.userId;
      const userData = await User.findById(userId);

      if(!userData){
        res.status(400).json({
          message: "User not found"
        });
      }
      const fullName = userData.firstName+" "+userData.lastName;

      const location = ["Delhi", "Goa","Jammu", "Chotpta", "Kolkata", "Shimla", "Dehradun" ];

      let idx = Math.floor(Math.random() * location.length);
      
      res.status(200).json({
        success: true,
        data:{
          userId,
          fullName,
          email: userData.email,
          location: location[idx],
          userType: userData.userType,
          createdAt: userData.createdAt
        }
      });
    }catch(err){
      throw new Error("Error while fetching details");
      res.status(500).json({
        message: "Server Error"
      })
    }
};