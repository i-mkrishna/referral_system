const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  referralCode: {
    type: String,
    unique: true,
    required: true,
  },
  referredBy: String,
  referrals: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Ensure that the referral code is unique
    const existingUser = await this.constructor.findOne({
      referralCode: this.referralCode,
    });
    if (existingUser) {
      throw new Error("Referral code must be unique.");
    }
  }
  next();
});

userSchema.methods.getReferrals = async function () {
  return this.model("User")
    .find({ _id: { $in: this.referrals } })
    .select("name email referralCode");
};

userSchema.methods.getEarnings = async function () {
  return this.model("Earning")
    .find({ user: this._id })
    .populate("source", "name email referralCode");
};

module.exports = mongoose.model("User", userSchema);
