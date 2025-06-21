require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Earning = require("../models/Earning");

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/referral_system');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const clean = async () => {
    await connect();

    console.log('Cleaning database...');
    await User.deleteMany();
    await Earning.deleteMany();

    console.log('Database cleaned successfully!');
    process.exit(0);
};

clean().catch(error => {
    console.error('Clean error:', error);
    process.exit(1);
}); 