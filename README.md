# Cycling Promotion Web Application

A MERN stack web application to encourage cycling, track rides, and award badges.

## Features

- **Authentication**: User & Admin roles (JWT).
- **Route Management**: Admin interface to draw and save cycling routes on Google Maps.
- **Ride Tracking**: Live GPS tracking for users, matching their path against the route.
- **Gamification**: Earn badges for achievements (First Ride, 5 Routes, 25km).
- **Dashboard**: View stats and available routes.

## Prerequisites

- Node.js (v14+)
- MongoDB (Running locally or Atlas URI)
- Google Maps API Key (with Maps, Places, Geometry, Drawing libraries enabled)

## Installation

### Backend

1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   - Duplicate any `.env.example` to `.env` (or use the provided defaults).
   - Set `MONGO_URI` and `JWT_SECRET`.

4. Start server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Create `.env.local` file.
   - Add `VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY`.

4. Start Vite dev server:
   ```bash
   npm run dev
   ```

## Usage

1. **Register**: Create a user account.
2. **Admin**: Create a route via `/admin/create-route` (you may need to manually set role to 'admin' in DB for valid access currently, or use the registration logic if adapted).
   - *Note: Default registration creates 'user'. To be an admin, update the user document in MongoDB: `db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})`.*
3. **Ride**: Go to Dashboard -> Start a Ride. Select a route and track your progress.
4. **Badges**: Finish rides to earn badges!

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, @react-google-maps/api
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB
