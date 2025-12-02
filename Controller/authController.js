//External modules
const { check } = require("express-validator");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

//Local modules
const User = require("../Models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    isLoggedIn: false,
    errors: [],
    oldInput: {},
    user: {}
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).render("auth/login", {
      isLoggedIn: false,
      errors: ["Invailed user name or password"],
      oldInput: { email },
    user: {}
    });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        isLoggedIn: false,
        errors: ["Invailed user name or password"],
        oldInput: { email },
        user: {}
      });
    }


    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id && user._id.toString ? user._id.toString() : user._id,
      firstName: user.firstName,
      email: user.email,
      userType: user.userType,
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save failed:', err);
        return next(err);
      }
      console.log('Session saved successfully for:', req.session.user.email);
      return res.redirect('/');
    });
  } catch (err) {
    console.error('Error in login flow:', err);
    return next(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: "guest",
    },
    user: {}
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

  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: {
          firstName,
          lastName,
          email,
          password,
          userType,
        },
        user: {}
      });
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
        res.redirect("/login");
      })
      .catch((err) => {
        console.log("Error registering user:", err);
        return res.status(500).render("auth/signup", {
          isLoggedIn: false,
          errors: ["An error occurred while registering. Please try again."],
          oldInput: {
            firstName,
            lastName,
            email,
            password,
            userType,
          },
          user: {}
        });
      });
  },
];
