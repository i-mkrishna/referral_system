const Earning = require("../models/Earning");
const User = require("../models/User");
const { MIN_PURCHASE_AMOUNT } = require("../utils/constants");
const socketManager = require("../utils/socketManager");

exports.purchase = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < MIN_PURCHASE_AMOUNT) {
      return res
        .status(400)
        .json({ msg: `Amount must be at least ₹${MIN_PURCHASE_AMOUNT}` });
    }

    // Get buyer information
    const buyer = await User.findById(req.user.id);
    if (!buyer || !buyer.isActive) {
      return res.status(403).json({ msg: "User inactive or not found" });
    }

    console.log(`Processing purchase of ₹${amount} by ${buyer.name}`);

    // Find level 1 referrer
    if (buyer.referredBy) {
      const level1 = await User.findOne({
        referralCode: buyer.referredBy,
        isActive: true,
      });

      if (level1) {
        // Create level 1 earning (5%)
        const level1Amount = Math.round(amount * 0.05);
        await Earning.create({
          user: level1._id,
          source: buyer._id,
          level: 1,
          amount: level1Amount,
        });

        console.log(`Level 1 earning: ₹${level1Amount} for ${level1.name}`);

        // Send real-time notification to level 1 user
        socketManager.emitToUser(level1._id.toString(), "earning", {
          from: buyer.name,
          level: 1,
          amount: level1Amount,
        });

        // Find level 2 referrer
        if (level1.referredBy) {
          const level2 = await User.findOne({
            referralCode: level1.referredBy,
            isActive: true,
          });

          if (level2) {
            // Create level 2 earning (1%)
            const level2Amount = Math.round(amount * 0.01);
            await Earning.create({
              user: level2._id,
              source: buyer._id,
              level: 2,
              amount: level2Amount,
            });

            console.log(`Level 2 earning: ₹${level2Amount} for ${level2.name}`);

            // Send real-time notification to level 2 user
            socketManager.emitToUser(level2._id.toString(), "earning", {
              from: buyer.name,
              level: 2,
              amount: level2Amount,
            });
          }
        }
      }
    }

    res.json({
      msg: "Purchase recorded and earnings distributed successfully!",
      amount: amount,
      buyer: buyer.name
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ msg: "Error processing purchase. Please try again." });
  }
};
