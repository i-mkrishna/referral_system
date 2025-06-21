# Referral System

A complete multi-level referral system built with Node.js, Express, MongoDB, and Socket.IO. Features real-time earnings tracking, user authentication, and a beautiful web interface.

## Features

- 🔐 **User Authentication** - Secure signup/login with JWT tokens
- 👥 **Multi-level Referrals** - 2-level deep referral system
- 💰 **Earnings Tracking** - Automatic commission calculation and distribution
- 🔔 **Real-time Notifications** - Socket.IO powered live earnings updates
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎯 **Purchase System** - Integrated purchase flow with commission distribution
- 📊 **Dashboard** - Comprehensive user dashboard with earnings and referrals

## System Architecture

### Referral Commission Structure

- **Level 1**: 5% commission from direct referrals
- **Level 2**: 1% commission from second-level referrals
- **Minimum Purchase**: ₹1000 to trigger commissions

### Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Frontend**: EJS templates, Vanilla JavaScript
- **Styling**: Custom CSS with modern design

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd referral_system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/referral_system
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
```

### 4. Database Setup

Start MongoDB and run the seed script to populate test data:

```bash
npm run seed
```

### 5. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:8080`

## Usage Guide

### Getting Started

1. **Sign Up**: Create a new account at `/signup`
2. **Optional**: Use a referral code during signup to join someone's network
3. **Dashboard**: View your referral code, earnings, and referrals
4. **Share**: Share your referral code to build your network
5. **Purchase**: Make purchases to generate commissions for your upline

### Test Accounts (after running seed)

```
Email: root@test.com
Password: password123
Role: Root user with test referrals

Email: l1_user_1@test.com
Password: password123
Role: Level 1 user

Email: l2_user_0_1@test.com
Password: password123
Role: Level 2 user
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Purchase

- `POST /api/purchase` - Record a purchase and distribute commissions

### Reports

- `GET /api/report/earnings` - Get user's earnings summary
- `GET /api/report/referrals` - Get user's referrals list

### Dashboard

- `GET /api/dashboard` - Get complete dashboard data

## Real-time Features

The system uses Socket.IO for real-time updates:

- **Earnings Notifications**: Users receive instant notifications when they earn commissions
- **Live Dashboard Updates**: Earnings update in real-time without page refresh
- **Browser Notifications**: Optional browser notifications for new earnings

## File Structure

```
referral_system/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── purchaseController.js # Purchase and commission logic
│   └── reportController.js   # Reports and analytics
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema and methods
│   └── Earning.js           # Earnings tracking schema
├── public/
│   ├── socket.js            # Client-side Socket.IO
│   └── style.css            # Application styles
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── purchaseRoutes.js    # Purchase routes
│   └── reportRoutes.js      # Report routes
├── scripts/
│   ├── fullSeed.js          # Database seeding
│   └── clean.js             # Database cleanup
├── utils/
│   ├── constants.js         # Application constants
│   ├── generateReferralCode.js # Referral code generator
│   └── logRequestInfo.js    # Request logging utility
├── views/
│   ├── dashboard.ejs        # Dashboard template
│   ├── login.ejs           # Login form
│   ├── signup.ejs          # Registration form
│   └── purchase.ejs        # Purchase form
├── server.js               # Main server file
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables
```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server
- `npm run seed` - Populate database with test data
- `npm run clean` - Clean database
- `npm test` - Run tests

### Database Models

#### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  referralCode: String (unique),
  referredBy: String,
  referrals: [ObjectId],
  isActive: Boolean
}
```

#### Earning Model

```javascript
{
  user: ObjectId (ref: User),
  source: ObjectId (ref: User),
  level: Number (1 or 2),
  amount: Number,
  timestamp: Date
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **Session Management**: Secure session handling
- **CORS Protection**: Configured for secure cross-origin requests

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Verify database permissions

2. **Port Already in Use**

   - Change PORT in .env file
   - Kill existing processes on port 8080

3. **JWT Token Issues**

   - Clear localStorage in browser
   - Check JWT_SECRET in .env file
   - Ensure token hasn't expired

4. **Socket.IO Not Working**
   - Check browser console for errors
   - Verify server is running
   - Clear browser cache

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
# referral_system
