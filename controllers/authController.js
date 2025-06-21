const logRequestInfo = require("../utils/logRequestInfo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateReferralCode = require("../utils/generateReferralCode");

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  logRequestInfo(req, "Signup attempt");

  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const { name, email, password, referredBy } = req.body;
    if (!name || name.length < 3) {
      return res
        .status(400)
        .json({ msg: "Name must be at least 3 characters long" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();

    const newUser = new User({
      name,
      email,
      password: hashed,
      referralCode,
      referredBy,
      isActive: true,
    });

    if (referredBy) {
      const parent = await User.findOne({
        referralCode: referredBy,
        isActive: true,
      });
      if (!parent)
        return res.status(400).json({ msg: "Invalid referral code" });

      parent.referrals.push(newUser._id);
      await parent.save();
    }

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

exports.login = async (req, res) => {
  logRequestInfo(req, "Login attempt");

  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const { email, password } = req.body;

    if (!email.includes("@")) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};
