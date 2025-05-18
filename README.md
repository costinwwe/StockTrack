# StockTrack

A modern inventory management system built with React, Node.js, and MongoDB.

## Features

- 📊 Real-time inventory tracking
- 🔐 User authentication and authorization
- 💳 PRO subscription system with Stripe integration
- 🌙 Dark mode support
- 📱 Responsive design
- 📈 Analytics and reporting
- 🔔 Email notifications

## Tech Stack

- **Frontend**: React, Redux, SCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment**: Stripe
- **Email**: Nodemailer

## Deployment (Railway)

### 1. Prerequisites
- Make sure you have a Railway account: https://railway.app/
- Your repository should have the following structure:
  ```
  client/
  server/
  railway.toml
  package.json (root, for workspaces)
  ```

### 2. Root package.json (workspaces)
Create a `package.json` in the root with:
```json
{
  "name": "stocktrack-monorepo",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ]
}
```

### 3. Railway Configuration
- The `railway.toml` file is already set up for monorepo deployment.
- Health check endpoint is `/api/health`.

### 4. Environment Variables
Set these in Railway:
- `MONGODB_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `REACT_APP_API_URL` (for frontend)
- Any others your app requires

### 5. Build & Start Commands
Railway will use the commands in `railway.toml`:
- **Build:** `cd client && npm install && npm run build && cd ../server && npm install`
- **Start:** `cd server && npm start`

### 6. Deploy
- Push your code to GitHub.
- Create a new Railway project from your repo.
- Railway will build and deploy your app automatically.

---

## Local Development
- Run frontend: `cd client && npm install && npm start`
- Run backend: `cd server && npm install && npm start`

---

## License
MIT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/costinwwe/StockTrack.git
cd StockTrack
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the variables with your configuration

4. Start the development servers:
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm start
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@stocktrack.com

# Client URL
CLIENT_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter)

Project Link: [https://github.com/costinwwe/StockTrack](https://github.com/costinwwe/StockTrack) 