# Stock Tracker Application

A full-stack application for tracking and managing inventory/stock with user authentication and subscription features.

## Features

- User authentication and authorization
- Inventory/Stock management
- Subscription-based access using Stripe
- Email notifications
- Responsive design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Stripe Integration
- Nodemailer

### Frontend
- React.js
- React Router
- Axios
- Stripe.js

## Prerequisites

- Node.js (>=14.0.0)
- MongoDB
- Stripe Account
- Email Service Account

## Environment Variables

Create a `config.env` file in the `server/config` directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
EMAIL_SERVICE=your_email_service
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_from_email
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_MONTHLY_PRICE_ID=your_stripe_monthly_price_id
STRIPE_YEARLY_PRICE_ID=your_stripe_yearly_price_id
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/stock-tracker.git
cd stock-tracker
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

## Running the Application

1. Start the backend server
```bash
cd server
npm run dev
```

2. Start the frontend development server
```bash
cd client
npm start
```

## Deployment

The application can be deployed on Render:
- Backend: Web Service
- Frontend: Static Site

## License

MIT

## Author

Costin 