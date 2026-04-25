//Core Module
const path = require("path");
const fs = require("fs");

//Local Module
const mainDir = require("../utils/pathUtil");
const Home = require("../Models/home");

exports.getEditHomes = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    // 🔐 Role check (defensive)
    if (req.user.userType !== "host") {
      return res.status(403).json({ message: "Only hosts allowed" });
    }

    const home = await Home.findById(homeId);

    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    if (home.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    return res.status(200).json(home);

  } catch (err) {
    console.error("Error fetching home:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.postAddHome = async (req, res) => {
  try {
    //Role check
    if (req.user.userType !== "host") {
      return res.status(403).json({ message: "Only hosts can add homes" });
    }

    const { houseName, price, location, state, description, category } = req.body;

    if (!houseName || !price || !location || !state) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(422).json({ message: "Image is required" });
    }

    const home = new Home({
      houseName,
      price,
      location,
      state,
      description,
      category,
      photo: req.file.filename,
      userId: req.user.userId,
    });

    const result = await home.save();

    console.log("Home Created:", result);

    return res.status(201).json({
      success: true,
      message: "Home added successfully",
    });

  } catch (err) {
    console.error("Add home error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getHostHomes = async (req, res) => {
  try {
    // Role check
    if (req.user.userType !== "host") {
      return res.status(403).json({ message: "Only hosts allowed" });
    }

    const homes = await Home.find({ userId: req.user.userId });

    return res.status(200).json(homes);

  } catch (err) {
    console.error("Fetch host homes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.postEditHomes = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    // Role check
    if (req.user.userType !== "host") {
      return res.status(403).json({ message: "Only hosts allowed" });
    }

    const home = await Home.findById(homeId);

    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    //Ownership check
    if (home.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const { houseName, price, location, state, description, category } = req.body;

    // ✅ Update fields
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.state = state;
    home.description = description;
    home.category = category;

    // 🖼 Handle image update
    if (req.file) {
      if (home.photo) {
        const oldPath = path.join(mainDir, "uploads", home.photo);

        fs.unlink(oldPath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }

      home.photo = req.file.filename;
    }

    const result = await home.save();

    console.log("Home Updated:", result);

    return res.status(200).json({
      success: true,
      message: "Home updated successfully",
    });

  } catch (err) {
    console.error("Edit home error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.postDeletetHome = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    // 🔐 Role check
    if (req.user.userType !== "host") {
      return res.status(403).json({ message: "Only hosts allowed" });
    }

    const home = await Home.findById(homeId);

    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    // Ownership check
    if (home.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete image
    if (home.photo) {
      const imagePath = path.join(mainDir, "uploads", home.photo);

      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    await Home.findByIdAndDelete(homeId);

    return res.status(200).json({
      success: true,
      message: "Home deleted successfully",
    });

  } catch (err) {
    console.error("Delete home error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};