//External modules
const { check } = require("express-validator");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Local modules
const User = require("../Models/user");

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).json({
        errors: ["Invailed user name or password"],
        oldInput: { email },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).json({
        errors: ["Invailed user name or password"],
        oldInput: { email },
      });
    }

    const token = jwt.sign(
      {
      userId: user._id,
      email: user.email,
      userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
          userType: user.userType,
        },
      });
    
  } catch (err) {
    console.error("Error in login flow:", err);
    return next(err);
  }
};

exports.postLogout = (req, res) => {
  res.clearCookie("token");
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.postSignup = [
  check("firstName")
    .notEmpty()
    .withMessage("First Name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name must be at least 2 characters long")
    .matches(/^[A-Za-z]+$/)
    .withMessage("First Name must contain only alphabetic characters"),

  check("lastName")
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage("Last Name must contain only alphabetic characters"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("User Type is required")
    .isIn(["guest", "host"])
    .withMessage("Invalid User Type"),

  check("terms").custom((value) => {
    if (value !== "on") {
      throw new Error("You must accept the terms and conditions");
    }
    return true;
  }),

  (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array().map((err) => err.msg) });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const newUser = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
        });
        return newUser.save();
      })
      .then(() => {
        console.log("User registered successfully");
        res.status(201).json({ message: "User registered successfully" });
      })
      .catch((err) => {
        console.log("Error registering user:", err);
        return res.status(500).json({ errors: ["Internal server error"] });
      });
  },
];

exports.getMe = async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({ isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.json({ isLoggedIn: false });
    }

    return res.json({
      isLoggedIn: true,
      user,
    });
  } catch {
    return res.json({ isLoggedIn: false });
  }
};