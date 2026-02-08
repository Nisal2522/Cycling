# API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 🗺️ Route Endpoints

### Get All Routes
```http
GET /api/routes
```

### Get Route by ID
```http
GET /api/routes/:id
```

### Create Route (Admin/City Planner)
```http
POST /api/routes
Authorization: Bearer <token>

{
  "name": "Colombo Beach Route",
  "distance": 15.5,
  "difficulty": "Medium",
  "polyline": [
    {"lat": 6.9271, "lng": 79.8612},
    {"lat": 6.9281, "lng": 79.8622}
  ],
  "safetyFeatures": ["bike_lane", "well_lit"],
  "safetyRating": 4
}
```

### Delete Route (Admin)
```http
DELETE /api/routes/:id
Authorization: Bearer <token>
```

---

## 🚴 Ride Endpoints

### Start Ride
```http
POST /api/rides/start
Authorization: Bearer <token>

{
  "routeId": "route_id_here"
}
```

### Update Ride Progress
```http
PUT /api/rides/:id/update
Authorization: Bearer <token>

{
  "lat": 6.9271,
  "lng": 79.8612
}
```

### Finish Ride
```http
PUT /api/rides/:id/finish
Authorization: Bearer <token>
```

### Get My Rides
```http
GET /api/rides/myrides
Authorization: Bearer <token>
```

---

## ⭐ Review Endpoints (CRUD)

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>

{
  "routeId": "route_id",
  "rating": 5,
  "comment": "Great route!",
  "safetyIssues": ["heavy_traffic"]
}
```

### Get Reviews by Route
```http
GET /api/reviews/route/:routeId
```

### Get My Reviews
```http
GET /api/reviews/my-reviews
Authorization: Bearer <token>
```

### Get Review by ID
```http
GET /api/reviews/:id
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>

{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### Mark Review Helpful
```http
POST /api/reviews/:id/helpful
Authorization: Bearer <token>
```

---

## 🚨 Safety Incident Endpoints (CRUD)

### Create Incident
```http
POST /api/safety-incidents
Authorization: Bearer <token>

{
  "routeId": "route_id",
  "type": "hazard",
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "description": "Large pothole on bike lane",
  "severity": "high"
}
```

### Get All Incidents (Admin/Moderator)
```http
GET /api/safety-incidents?status=reported&severity=high
Authorization: Bearer <token>
```

### Get Incidents by Route
```http
GET /api/safety-incidents/route/:routeId
```

### Get My Incidents
```http
GET /api/safety-incidents/my-incidents
Authorization: Bearer <token>
```

### Get Incident by ID
```http
GET /api/safety-incidents/:id
Authorization: Bearer <token>
```

### Update Incident (Admin/Moderator)
```http
PUT /api/safety-incidents/:id
Authorization: Bearer <token>

{
  "status": "resolved",
  "severity": "medium",
  "resolutionNotes": "Issue fixed by city council"
}
```

### Delete Incident (Admin/Moderator)
```http
DELETE /api/safety-incidents/:id
Authorization: Bearer <token>
```

---

## 🏆 Challenge Endpoints (CRUD)

### Create Challenge (Admin/City Planner)
```http
POST /api/challenges
Authorization: Bearer <token>

{
  "name": "Cycle 100km This Month",
  "description": "Complete 100km of cycling",
  "type": "distance",
  "target": 100,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "rewards": {
    "points": 200,
    "badge": "badge_id_here"
  }
}
```

### Get All Challenges
```http
GET /api/challenges?type=distance&isActive=true
```

### Get Challenge by ID
```http
GET /api/challenges/:id
```

### Join Challenge
```http
POST /api/challenges/:id/join
Authorization: Bearer <token>
```

### Update Challenge Progress
```http
PUT /api/challenges/:id/update-progress
Authorization: Bearer <token>

{
  "distance": 10.5,
  "routes": 1,
  "days": 3
}
```

### Update Challenge (Admin/City Planner)
```http
PUT /api/challenges/:id
Authorization: Bearer <token>

{
  "name": "Updated Challenge Name",
  "isActive": false
}
```

### Delete Challenge (Admin/City Planner)
```http
DELETE /api/challenges/:id
Authorization: Bearer <token>
```

---

## 🎁 Reward Endpoints (CRUD)

### Create Reward (Admin)
```http
POST /api/rewards
Authorization: Bearer <token>

{
  "name": "10% Off at Bike Shop",
  "description": "Discount at local bike shop",
  "pointsRequired": 500,
  "type": "discount",
  "partner": "Bike Shop Colombo",
  "discountCode": "CYCLING10",
  "discountPercentage": 10,
  "expiryDate": "2024-12-31",
  "stock": 100
}
```

### Get All Rewards
```http
GET /api/rewards?type=discount&minPoints=100&maxPoints=1000
```

### Get My Rewards
```http
GET /api/rewards/my-rewards
Authorization: Bearer <token>
```

### Get Reward by ID
```http
GET /api/rewards/:id
```

### Redeem Reward
```http
POST /api/rewards/:id/redeem
Authorization: Bearer <token>
```

### Update Reward (Admin)
```http
PUT /api/rewards/:id
Authorization: Bearer <token>

{
  "pointsRequired": 450,
  "available": true,
  "stock": 50
}
```

### Delete Reward (Admin)
```http
DELETE /api/rewards/:id
Authorization: Bearer <token>
```

---

## 📊 Response Examples

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### Ride Completion Response
```json
{
  "message": "Ride completed",
  "ride": { ... },
  "newBadges": ["First Ride", "25km Total Ride"],
  "pointsEarned": 35,
  "co2Saved": "4.95",
  "totalPoints": 150,
  "totalCo2Saved": "49.50"
}
```

---

## 🔑 Role Permissions

| Endpoint | User | Moderator | City Planner | Admin |
|----------|------|-----------|--------------|-------|
| Create Route | ❌ | ❌ | ✅ | ✅ |
| Create Challenge | ❌ | ❌ | ✅ | ✅ |
| Create Reward | ❌ | ❌ | ❌ | ✅ |
| Update Safety Incident | ❌ | ✅ | ❌ | ✅ |
| Delete Review | Own | ✅ | ❌ | ✅ |

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Distances are in kilometers
- CO2 is in grams (display as kg: divide by 1000)
- Points are integers
- Ratings are 1-5 (integers)
- JWT tokens expire in 30 days

---

**Last Updated:** 2024
