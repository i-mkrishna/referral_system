const { REFERRALS_PAGE_LIMIT } = require("../utils/constants");
const User = require("../models/User");
const Earning = require("../models/Earning");

exports.getEarnings = async (req, res) => {
  const earnings = await Earning.find({ user: req.user.id }).populate(
    "source",
    "name"
  );

  const total = earnings.reduce((sum, e) => sum + e.amount, 0);
  const level1Earnings = earnings
    .filter((e) => e.level === 1)
    .reduce((sum, e) => sum + e.amount, 0);
  const level2Earnings = earnings
    .filter((e) => e.level === 2)
    .reduce((sum, e) => sum + e.amount, 0);

  res.json({
    total,
    level1Earnings,
    level2Earnings,
    earnings,
  });
};

exports.getReferrals = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = REFERRALS_PAGE_LIMIT;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user.id).populate({
    path: "referrals",
    select: "name email referralCode",
    options: { limit, skip },
  });

  res.json({ referrals: user.referrals });
};
