require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Earning = require("../models/Earning");
const bcrypt = require("bcrypt");
const generateReferralCode = require("../utils/generateReferralCode");

const JWT_SECRET = 'baburao ka secret he ese nhi decrypt hoga';

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/referral_system');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seed = async () => {
    await connect();

    console.log('Cleaning existing data...');
    await User.deleteMany();
    await Earning.deleteMany();

    const password = await bcrypt.hash("password123", 10);

    console.log('Creating root user...');
    // Create root user
    const root = new User({
        name: "Root User",
        email: "root@test.com",
        password,
        referralCode: generateReferralCode(),
    });

    await root.save();
    console.log(`Root user created with code: ${root.referralCode}`);

    const level1Users = [];
    const level2Users = [];

    console.log('Creating level 1 users...');
    // Create 2 level-1 users
    for (let i = 1; i <= 2; i++) {
        const user = new User({
            name: `L1_User_${i}`,
            email: `l1_user_${i}@test.com`,
            password,
            referralCode: generateReferralCode(),
            referredBy: root.referralCode,
        });

        level1Users.push(user);
        root.referrals.push(user._id);
    }

    await root.save();
    await User.insertMany(level1Users);
    console.log(`Created ${level1Users.length} level 1 users`);

    console.log('Creating level 2 users...');
    // Create 2 level-2 users under each level-1 user
    for (let i = 0; i < level1Users.length; i++) {
        const l1 = level1Users[i];

        for (let j = 1; j <= 2; j++) {
            const l2 = new User({
                name: `L2_User_${i}_${j}`,
                email: `l2_user_${i}_${j}@test.com`,
                password,
                referralCode: generateReferralCode(),
                referredBy: l1.referralCode,
            });

            l1.referrals.push(l2._id);
            level2Users.push(l2);
        }

        await l1.save();
    }

    await User.insertMany(level2Users);
    console.log(`Created ${level2Users.length} level 2 users`);

    console.log('Simulating purchases and earnings...');
    // Simulate purchases (earning logic manually)
    const simulatePurchase = async (buyer, amount) => {
        const level1 = await User.findOne({ referralCode: buyer.referredBy });
        if (level1) {
            const level1Amount = Math.round(amount * 0.05);
            await Earning.create({
                user: level1._id,
                source: buyer._id,
                level: 1,
                amount: level1Amount,
            });

            if (level1.referredBy) {
                const level2 = await User.findOne({ referralCode: level1.referredBy });
                if (level2) {
                    const level2Amount = Math.round(amount * 0.01);
                    await Earning.create({
                        user: level2._id,
                        source: buyer._id,
                        level: 2,
                        amount: level2Amount,
                    });
                }
            }
        }
    };

    // Purchases by each L1 and L2
    for (const user of [...level1Users, ...level2Users]) {
        await simulatePurchase(user, 2000); // > 1000, valid
    }

    console.log("Test data seeded successfully!");
    console.log("\n Test Accounts:");
    console.log("Root User: root@test.com / password123");
    console.log("L1 User 1: l1_user_1@test.com / password123");
    console.log("L1 User 2: l1_user_2@test.com / password123");
    console.log("L2 User 1: l2_user_0_1@test.com / password123");
    console.log("L2 User 2: l2_user_0_2@test.com / password123");
    console.log("L2 User 3: l2_user_1_1@test.com / password123");
    console.log("L2 User 4: l2_user_1_2@test.com / password123");

    console.log("\n Visit: http://localhost:8080");

    process.exit(0);
};

seed().catch(error => {
    console.error('Seed error:', error);
    process.exit(1);
}); 