const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getEarnings,
  getReferrals,
} = require("../controllers/reportController");

router.get("/earnings", auth, getEarnings);
router.get("/referrals", auth, getReferrals);


module.exports = router;
