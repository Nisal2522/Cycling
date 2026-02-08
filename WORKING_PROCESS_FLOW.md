# Working Process Flow - Sustainable Cycling App

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Authentication Flow](#authentication-flow)
4. [Route Management Flow](#route-management-flow)
5. [Ride Tracking Flow](#ride-tracking-flow)
6. [Review & Rating System](#review--rating-system)
7. [Safety Incident Reporting](#safety-incident-reporting)
8. [Challenge System](#challenge-system)
9. [Rewards & Points System](#rewards--points-system)
10. [CO2 & Environmental Impact](#co2--environmental-impact)
11. [API Endpoints Reference](#api-endpoints-reference)

---

## System Overview

The Sustainable Cycling App promotes cycling through:
- **Safe Route Mapping**: Admin/City Planners create verified safe routes
- **Gamification**: Points, badges, and rewards for cycling activities
- **Community Engagement**: Reviews, safety reports, and challenges
- **Environmental Impact**: CO2 savings tracking and visualization

---

## User Roles & Permissions

### 1. **User** (Default Role)
- Register and login
- View routes and start rides
- Submit reviews and ratings
- Report safety incidents
- Join challenges
- Redeem rewards
- View personal stats

### 2. **Admin**
- All user permissions
- Create/edit/delete routes
- Create/edit/delete challenges
- Create/edit/delete rewards
- Manage safety incidents (resolve, dismiss)
- Verify reviews
- Access analytics dashboard

### 3. **Moderator**
- All user permissions
- Manage safety incidents
- Verify/delete reviews
- Moderate community content

### 4. **City Planner**
- All user permissions
- Create/edit routes
- Create/edit challenges
- View analytics and data exports
- Access heatmaps and usage patterns

---

## Authentication Flow

### Registration Process
```
1. User submits: name, email, password
   ↓
2. Backend validates:
   - All fields present
   - Email format valid
   - Password length >= 6
   ↓
3. Check if email exists
   ↓
4. Create user with role='user' (default)
   ↓
5. Hash password (pre-save hook)
   ↓
6. Generate JWT token
   ↓
7. Return: user data + token
```

### Login Process
```
1. User submits: email, password
   ↓
2. Find user by email
   ↓
3. Compare password (bcrypt)
   ↓
4. Generate JWT token
   ↓
5. Return: user data + token
```

### Protected Routes
- All routes except `/api/auth/register` and `/api/auth/login` require JWT token
- Token sent in header: `Authorization: Bearer <token>`
- Middleware validates token and attaches `req.user`

---

## Route Management Flow

### Creating a Route (Admin/City Planner)
```
1. Admin/City Planner logs in
   ↓
2. Navigate to Admin Panel
   ↓
3. Draw route on map using Google Maps Drawing Manager
   ↓
4. Submit route form:
   - Name
   - Distance (auto-calculated)
   - Difficulty (Easy/Medium/Hard/Expert)
   - Safety features (bike_lane, dedicated_path, etc.)
   - Safety rating (1-5)
   ↓
5. Backend creates route:
   - Saves polyline coordinates
   - Sets createdBy = admin/city_planner ID
   - Default safetyRating = 3
   ↓
6. Route available for all users
```

### Viewing Routes (All Users)
```
1. User requests: GET /api/routes
   ↓
2. Backend returns all active routes
   ↓
3. Frontend displays:
   - Route name, distance, difficulty
   - Safety rating (stars)
   - Average user rating
   - Safety features icons
   ↓
4. User can filter by:
   - Difficulty
   - Distance range
   - Safety rating
   - Safety features
```

### Route Safety Rating Calculation
```
Route Safety Rating = Average of all user reviews
   ↓
Updated automatically when:
- New review submitted
- Review updated
- Review deleted
   ↓
Displayed as: ⭐⭐⭐⭐⭐ (1-5 stars)
```

---

## Ride Tracking Flow

### Starting a Ride
```
1. User selects a route from dashboard
   ↓
2. Click "Start Ride"
   ↓
3. POST /api/rides/start
   Body: { routeId }
   ↓
4. Backend creates ride:
   - user = current user ID
   - route = selected route ID
   - status = 'ongoing'
   - startTime = now
   - gpsPoints = []
   - distanceCovered = 0
   ↓
5. Frontend starts GPS tracking
```

### During Ride (Real-time Updates)
```
1. Frontend captures GPS location every 5-10 seconds
   ↓
2. PUT /api/rides/:id/update
   Body: { lat, lng }
   ↓
3. Backend:
   - Adds GPS point to ride.gpsPoints[]
   - Calculates distance from last point (Haversine)
   - Updates ride.distanceCovered (meters)
   - Calculates completionPercentage
   ↓
4. Frontend displays:
   - Current location on map
   - Distance covered
   - Completion percentage
   - Route path overlay
```

### Finishing a Ride
```
1. User clicks "Finish Ride"
   ↓
2. PUT /api/rides/:id/finish
   ↓
3. Backend calculates:
   a. Distance (km) = distanceCovered / 1000
   b. CO2 Saved (g) = distance * 99
   c. Points Earned:
      - Base: 10 points
      - 5km+: +25 points
      - 10km+: +50 points
      - 25km+: +150 points
   ↓
4. Update User:
   - totalDistance += distance
   - completedRoutes += 1
   - co2Saved += CO2 saved
   - points += pointsEarned
   - Update streak (if consecutive days)
   - Calculate environmental impact:
     * treesEquivalent = co2Saved / 21000
     * carKmEquivalent = co2Saved / 120
   ↓
5. Check for badge achievements:
   - First Ride (1st route)
   - 5 Routes Completed
   - 25km Total Ride
   - Environmental Champion (100kg CO2)
   - Marathon Rider (50km in one ride)
   - Weekly Warrior (7-day streak)
   ↓
6. Update challenge progress:
   - Find active challenges user joined
   - Update progress based on challenge type:
     * distance: += distanceKm
     * routes: += 1
     * streak: = currentStreak
   - Check if challenge completed
   - Award challenge rewards if completed
   ↓
7. Return response:
   - Ride details
   - New badges earned
   - Points earned
   - CO2 saved
   - Total stats
```

---

## Review & Rating System

### Submitting a Review
```
1. User completes a ride
   ↓
2. Navigate to route details
   ↓
3. Submit review form:
   - Rating: 1-5 stars
   - Comment (optional)
   - Safety issues (checkboxes)
   ↓
4. POST /api/reviews
   Body: { routeId, rating, comment, safetyIssues }
   ↓
5. Backend:
   - Check if user already reviewed (prevent duplicates)
   - Create review
   - Update route averageRating
   - Update route reviewCount
   - Award 5 points to user
   ↓
6. Review appears on route page
```

### Review Update/Delete
```
Update:
- User can edit own review
- Admin/Moderator can edit any review
- PUT /api/reviews/:id

Delete:
- User can delete own review
- Admin/Moderator can delete any review
- DELETE /api/reviews/:id
- Route rating recalculated
```

### Mark Review as Helpful
```
1. User clicks "Helpful" on a review
   ↓
2. POST /api/reviews/:id/helpful
   ↓
3. Backend:
   - Increment helpful count
   - Add user to helpfulUsers array
   - Prevent duplicate votes
```

---

## Safety Incident Reporting

### Reporting an Incident
```
1. User notices safety issue on route
   ↓
2. Click "Report Safety Issue"
   ↓
3. Fill form:
   - Type: hazard/accident/unsafe_condition/etc.
   - Location: lat, lng (from map click)
   - Description
   - Severity: low/medium/high/critical
   - Images (optional)
   ↓
4. POST /api/safety-incidents
   ↓
5. Backend:
   - Create incident with status='reported'
   - Award 15 points to reporter
   ↓
6. Incident visible to:
   - All users (on route page)
   - Admin/Moderator (in dashboard)
```

### Managing Incidents (Admin/Moderator)
```
1. View all incidents: GET /api/safety-incidents
   ↓
2. Filter by: status, severity, route
   ↓
3. Update incident:
   PUT /api/safety-incidents/:id
   - Change status: investigating → resolved
   - Update severity
   - Add resolution notes
   ↓
4. Resolved incidents:
   - Hidden from public route view
   - Still visible in admin dashboard
   - Can be exported for city planning
```

---

## Challenge System

### Creating a Challenge (Admin/City Planner)
```
1. Admin/City Planner logs in
   ↓
2. POST /api/challenges
   Body: {
     name, description,
     type: distance/routes/streak/community/environmental,
     target: number,
     startDate, endDate,
     rewards: { points, badge }
   }
   ↓
3. Challenge created and active
```

### Joining a Challenge
```
1. User views active challenges
   GET /api/challenges
   ↓
2. Select challenge
   ↓
3. POST /api/challenges/:id/join
   ↓
4. Backend adds user to participants array
   - progress = 0
   - completed = false
   ↓
5. User now participating
```

### Challenge Progress Updates
```
Automatic updates when user completes activities:
   ↓
Ride completed → PUT /api/challenges/:id/update-progress
   ↓
Backend:
- Find challenge participant
- Update progress based on type:
  * distance: += ride distance
  * routes: += 1
  * streak: = user currentStreak
- Check if progress >= target
- If completed:
  * Mark participant.completed = true
  * Award challenge rewards (points, badge)
```

---

## Rewards & Points System

### Points Earning
```
Points are earned for:
- Completing a ride: 10 points
- Completing 5km: +25 points
- Completing 10km: +50 points
- Completing 25km: +150 points
- Submitting review: 5 points
- Reporting safety incident: 15 points
- Completing challenge: varies
```

### Points History
```
Every points transaction recorded:
- source: 'ride_completion', 'review', etc.
- amount: +points or -points
- description: human-readable
- timestamp: auto
```

### Redeeming Rewards
```
1. User views available rewards
   GET /api/rewards
   ↓
2. Filter by points available
   ↓
3. Select reward
   ↓
4. POST /api/rewards/:id/redeem
   ↓
5. Backend checks:
   - Reward available
   - Not expired
   - Stock available (if limited)
   - User has enough points
   ↓
6. Process redemption:
   - Deduct points from user
   - Update reward stock
   - Increment redeemedCount
   - Return discount code (if applicable)
   ↓
7. User receives:
   - Discount code
   - Confirmation
   - Updated points balance
```

---

## CO2 & Environmental Impact

### CO2 Calculation
```
Formula: CO2 Saved = Distance (km) × 99g
   ↓
Per Ride:
- Calculate distance from GPS points
- CO2 saved = distance × 99g
- Store in ride.co2Saved
   ↓
User Total:
- Sum all completed rides
- Store in user.co2Saved (grams)
- Convert to kg for display: co2Saved / 1000
```

### Environmental Impact Metrics
```
Calculated automatically:
   ↓
Trees Equivalent:
- 1 tree absorbs ~21kg CO2/year
- treesEquivalent = co2Saved / 21000
   ↓
Car Kilometers Equivalent:
- Car emits ~120g CO2/km
- carKmEquivalent = co2Saved / 120
   ↓
Displayed on:
- User dashboard
- Ride completion summary
- Leaderboards
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes` - Create route (Admin/City Planner)
- `DELETE /api/routes/:id` - Delete route (Admin)

### Rides
- `POST /api/rides/start` - Start a ride
- `PUT /api/rides/:id/update` - Update ride progress
- `PUT /api/rides/:id/finish` - Finish a ride
- `GET /api/rides/myrides` - Get user's rides

### Reviews (CRUD)
- `POST /api/reviews` - Create review
- `GET /api/reviews/route/:routeId` - Get reviews for route
- `GET /api/reviews/my-reviews` - Get user's reviews
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review helpful

### Safety Incidents (CRUD)
- `POST /api/safety-incidents` - Report incident
- `GET /api/safety-incidents` - Get all incidents (Admin/Moderator)
- `GET /api/safety-incidents/route/:routeId` - Get route incidents
- `GET /api/safety-incidents/my-incidents` - Get user's reports
- `GET /api/safety-incidents/:id` - Get incident by ID
- `PUT /api/safety-incidents/:id` - Update incident (Admin/Moderator)
- `DELETE /api/safety-incidents/:id` - Delete incident (Admin/Moderator)

### Challenges (CRUD)
- `POST /api/challenges` - Create challenge (Admin/City Planner)
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id` - Get challenge by ID
- `POST /api/challenges/:id/join` - Join challenge
- `PUT /api/challenges/:id/update-progress` - Update progress
- `PUT /api/challenges/:id` - Update challenge (Admin/City Planner)
- `DELETE /api/challenges/:id` - Delete challenge (Admin/City Planner)

### Rewards (CRUD)
- `POST /api/rewards` - Create reward (Admin)
- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/my-rewards` - Get user's rewards
- `GET /api/rewards/:id` - Get reward by ID
- `POST /api/rewards/:id/redeem` - Redeem reward
- `PUT /api/rewards/:id` - Update reward (Admin)
- `DELETE /api/rewards/:id` - Delete reward (Admin)

---

## Data Flow Examples

### Example 1: Complete Ride Cycle
```
1. User logs in → JWT token
2. Browse routes → GET /api/routes
3. Select route → View details
4. Start ride → POST /api/rides/start
5. Track ride → PUT /api/rides/:id/update (multiple times)
6. Finish ride → PUT /api/rides/:id/finish
   - Points calculated: 10 + 25 (if 5km+) = 35 points
   - CO2 calculated: 5km × 99g = 495g
   - Badge check: First Ride earned
   - Challenge progress updated
7. Submit review → POST /api/reviews (+5 points)
8. Total: 40 points, 495g CO2 saved
```

### Example 2: Safety Incident Resolution
```
1. User reports incident → POST /api/safety-incidents
   - Status: 'reported'
   - User gets 15 points
2. Admin views incidents → GET /api/safety-incidents
3. Admin investigates → Update status to 'investigating'
4. Admin resolves → PUT /api/safety-incidents/:id
   - Status: 'resolved'
   - Resolution notes added
   - Incident hidden from public route view
```

### Example 3: Challenge Participation
```
1. Admin creates challenge:
   - Type: 'distance'
   - Target: 50km
   - Rewards: 200 points + badge
2. User joins → POST /api/challenges/:id/join
3. User completes rides:
   - Ride 1: 10km → Progress: 10km
   - Ride 2: 15km → Progress: 25km
   - Ride 3: 25km → Progress: 50km ✓
4. Challenge auto-completed:
   - User gets 200 points
   - User gets badge
   - Participant marked as completed
```

---

## Security & Validation

### Input Validation
- Email format validation
- Password length (min 6)
- Rating range (1-5)
- Distance/coordinates validation
- File upload size limits

### Authorization
- JWT token required for protected routes
- Role-based access control:
  - User: Own data only
  - Moderator: + Content moderation
  - City Planner: + Route/challenge creation
  - Admin: Full access

### Data Protection
- Passwords hashed with bcrypt
- JWT tokens expire in 30 days
- User data sanitized before storage
- SQL injection prevention (MongoDB)

---

## Performance Optimizations

### Database Indexing
- User email: unique index
- Route reviews: compound index (route, user)
- Ride queries: indexed on user, status
- Challenge participants: indexed on user

### Caching Opportunities
- Route list (frequently accessed)
- Leaderboards (update every 5 minutes)
- Challenge progress (cache during active rides)

### Query Optimization
- Populate only necessary fields
- Limit pagination for large datasets
- Aggregate calculations done server-side

---

## Error Handling

### Common Errors
- `400`: Bad request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (resource doesn't exist)
- `500`: Server error (database/processing errors)

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## Testing Checklist

### User Flow Tests
- [ ] Register new user
- [ ] Login with credentials
- [ ] View routes
- [ ] Start and complete ride
- [ ] Submit review
- [ ] Report safety incident
- [ ] Join challenge
- [ ] Redeem reward

### Admin Flow Tests
- [ ] Create route
- [ ] Create challenge
- [ ] Create reward
- [ ] Resolve safety incident
- [ ] View analytics

### Edge Cases
- [ ] Duplicate review prevention
- [ ] Insufficient points for reward
- [ ] Expired challenge join attempt
- [ ] Invalid GPS coordinates
- [ ] Concurrent ride updates

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Implementation Complete
