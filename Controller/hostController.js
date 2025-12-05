//Core Module
const path = require("path");
const fs = require("fs");

//Local Module
const mainDir = require("../utils/pathUtil");
const Home = require("../Models/home");


exports.getEditHomes = async (req, res, next) => {
  const homeId = req.params.homeId;
  // const editing = req.query.editing === "true";

  await Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("home not found for editing");
        return res.status(400).json({ message: "Home not found" });
      }
      console.log(home);
      res.status(200).json(home);
    })
    .catch((err) => {
      console.log("Error fetching home for edit", err);
      res.status(500).json({ message: "Error fetching home" });
    });
};

exports.postAddHome = async (req, res, next) => {
  const { houseName, price, location, state, description, category } = req.body;
  const userId = req.session.user._id;

  // console.log("User session data:", req.file);

  if (!req.file) {
    return res.status(422).json({
      editing: false,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      errors:
        "Attached file is not an image. Please upload a valid image file.",
      oldInput: { houseName, price, location, state, description, category },
    });
  }

  const photo = req.file.filename;

  const house = new Home({
    houseName,
    price,
    location,
    state,
    photo,
    description,
    category,
    userId,
  });
  await house
    .save()
    .then((result) => {
      console.log("New Home Created: ", result);
      res.status(201).json({ message: "Home added successfully!" });
    })
    .catch((err) => {
      console.log("Error while creating new home", err);
    });
};

exports.getHostHomes = async (req, res) => {
  try {
    const hostId = req.session.user._id;
    const homes = await Home.find({ userId: hostId });
    res.status(200).json(homes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.postEditHomes = async (req, res, next) => {
  const { houseName, price, location, state, description, category } = req.body;
  const homeId = req.params.homeId;

  try {
    const home = await Home.findById(homeId);
    if (!home) {
      console.log("Home not found");
      return res.status(404).json({ message: "Home not found" });
    }

    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.state = state;
    home.description = description;
    home.category = category;

    if (req.file) {
      if (home.photo) {
        const oldImagePath = path.join(mainDir, "uploads", home.photo);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          } else {
            console.log("Old image deleted successfully");
          }
        });
      }
      home.photo = req.file.filename;
    }

    const result = await home.save();
    console.log("Home Updated: ", result);
    res.status(200).json({ message: "Home updated successfully!" });
  } catch (err) {
    console.log("Error while updating", err);
    res.status(500).json({ message: "Error updating home" });
  }
};

exports.postDeletetHome = async (req, res) => {
  try {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ message: "Home not found" });

    if (home.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Home.findByIdAndDelete(homeId);
    res.status(200).json({ success: true, message: "Home deleted successfully" });
  } catch (err) {
    console.error("Error deleting home", err);
    res.status(500).json({ message: "Error deleting home" });
  }
};

