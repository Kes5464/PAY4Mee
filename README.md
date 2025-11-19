# Pay4Me - Utility Payment Platform

A full-stack web application for recharging airtime, buying data, funding betting accounts, and paying for TV subscriptions.

## Features

- 📱 Airtime Recharge (MTN, Glo, Airtel, 9Mobile)
- 📶 Data Bundle Purchase
- 🎰 Betting Account Funding (SportyBet, 1xBet, Bet9ja)
- 📺 TV Subscriptions (DSTV, GOtv)
- 🔐 User Authentication with JWT
- 💾 Transaction History
- 🎨 Responsive Design

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive Design
- LocalStorage for session persistence

**Backend:**
- Node.js
- Express.js
- JWT Authentication
- Bcrypt for password hashing
- CORS enabled

## Installation

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Start the backend server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:3000`

3. **Open the frontend:**
Open `home.html` in your web browser or use a local server.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Services (Requires Authentication)
- `POST /api/airtime/purchase` - Purchase airtime
- `POST /api/data/purchase` - Purchase data bundle
- `POST /api/betting/fund` - Fund betting account
- `POST /api/tv/subscribe` - Subscribe to TV package

### Transactions
- `GET /api/transactions` - Get user transaction history

### Health Check
- `GET /api/health` - Check API status

## Usage

1. **Register an account** on the registration page
2. **Login** with your credentials
3. **Choose a service** from the navigation menu
4. **Fill in the required details** and submit
5. **View transaction confirmation** with reference number

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Token expiration (24 hours)
- Protected API routes
- CORS configuration

## Project Structure

```
pay4me/
├── server.js           # Backend server
├── package.json        # Node.js dependencies
├── home.html          # Home page
├── airtime.html       # Airtime page
├── data.html          # Data page
├── betting.html       # Betting page
├── tv.html            # TV subscription page
├── login.html         # Login page
├── register.html      # Registration page
├── styles.css         # Global styles
├── common.js          # Shared JavaScript
├── airtime.js         # Airtime functionality
├── data.js            # Data functionality
├── betting.js         # Betting functionality
├── tv.js              # TV functionality
└── auth.js            # Authentication functionality
```

## Development Notes

- The backend uses in-memory storage (arrays). For production, integrate a database like MongoDB, PostgreSQL, or MySQL.
- Update the `SECRET_KEY` in `server.js` and use environment variables.
- Add payment gateway integration for real transactions.
- Implement proper error logging and monitoring.

## License

ISC
