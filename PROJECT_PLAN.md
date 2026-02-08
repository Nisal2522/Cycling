# Project Plan: Sustainable Cities and Communities
## A Web App to Promote Cycling with Safe Routes and Rewards

---

## 1. PROJECT OVERVIEW

### 1.1 Project Title
**Sustainable Cities and Communities — A Web Application to Promote Cycling with Safe Routes and Rewards**

### 1.2 Alignment with UN Sustainable Development Goals (SDGs)
- **SDG 11: Sustainable Cities and Communities** - Making cities inclusive, safe, resilient, and sustainable
- **SDG 13: Climate Action** - Reducing carbon emissions through sustainable transportation
- **SDG 3: Good Health and Well-being** - Promoting physical activity and reducing air pollution

### 1.3 Problem Statement
Urban areas face challenges with:
- High carbon emissions from motorized transport
- Traffic congestion and air pollution
- Lack of safe cycling infrastructure
- Low adoption of cycling as a sustainable transportation mode
- Limited awareness of safe cycling routes

### 1.4 Solution
A web application that:
- Maps and promotes safe cycling routes
- Gamifies cycling through rewards and badges
- Tracks environmental impact (CO2 saved)
- Builds a community of cyclists
- Provides data for city planners to improve cycling infrastructure

---

## 2. RESEARCH FINDINGS

### 2.1 Key Research Areas

#### A. Sustainable Urban Mobility
- Cycling reduces CO2 emissions by ~0.5 kg per km compared to cars
- Safe cycling infrastructure increases cycling adoption by 20-30%
- Gamification increases user engagement by 40-60% in fitness apps

#### B. Route Safety Factors
- Dedicated bike lanes reduce accidents by 50%
- Traffic-calmed streets are safer for cyclists
- Well-lit routes increase usage, especially for women
- Route elevation and difficulty affect user choice

#### C. Behavioral Change Through Gamification
- Points, badges, and leaderboards motivate continued participation
- Social sharing increases accountability
- Progress tracking helps maintain habits
- Rewards can be tangible (discounts) or intrinsic (achievements)

### 2.2 Best Practices from Similar Apps
- **Strava**: Social features and route sharing
- **Komoot**: Route planning with difficulty ratings
- **Citymapper**: Urban mobility integration
- **Bike Citizens**: Focus on city cycling infrastructure

---

## 3. CURRENT SYSTEM ANALYSIS

### 3.1 Existing Features ✅
- User authentication (JWT-based)
- Admin panel for route creation
- GPS-based ride tracking
- Basic badge system (First Ride, 5 Routes, 25km)
- Dashboard with user statistics
- Google Maps integration (configured for Sri Lanka)
- Route management (CRUD operations)

### 3.2 Gaps to Address
- ❌ Route safety ratings and reviews
- ❌ Environmental impact tracking (CO2 saved)
- ❌ Advanced reward system (points, leaderboards)
- ❌ Community features (social sharing, groups)
- ❌ Route recommendations based on user preferences
- ❌ Safety incident reporting
- ❌ Integration with local businesses for rewards
- ❌ Analytics dashboard for city planners

---

## 4. PROPOSED FEATURES & IMPLEMENTATION PLAN

### PHASE 1: Enhanced Route Safety & Information (Weeks 1-3)

#### 4.1.1 Route Safety Ratings
**Implementation:**
- Add `safetyRating` field to Route model (1-5 stars)
- Add `safetyFeatures` array (bike lanes, traffic lights, low traffic, etc.)
- User reviews and ratings system
- Aggregate safety score from user feedback

**Database Schema:**
```javascript
// Route Model Enhancement
safetyRating: { type: Number, min: 1, max: 5, default: 3 },
safetyFeatures: [{
    type: String,
    enum: ['bike_lane', 'dedicated_path', 'low_traffic', 'well_lit', 'traffic_calmed']
}],
reviews: [{
    user: { type: ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    safetyIssues: [String],
    timestamp: Date
}],
averageRating: { type: Number, default: 0 }
```

#### 4.1.2 Route Filtering & Search
- Filter by difficulty, distance, safety rating
- Search by location/landmark
- Sort by popularity, safety, distance

#### 4.1.3 Safety Incident Reporting
- Users can report hazards, accidents, or unsafe conditions
- Admin can mark routes as temporarily unsafe
- Real-time safety alerts

---

### PHASE 2: Environmental Impact Tracking (Weeks 4-5)

#### 4.2.1 CO2 Emission Calculator
**Formula:** 
- Car emits ~120g CO2/km
- Cycling emits ~21g CO2/km (food production)
- **Savings per km: ~99g CO2**

**Implementation:**
- Calculate CO2 saved per ride
- Track cumulative CO2 saved per user
- Display environmental impact on dashboard
- Community-wide CO2 savings leaderboard

**Database Schema:**
```javascript
// User Model Enhancement
co2Saved: { type: Number, default: 0 }, // in grams
totalRides: { type: Number, default: 0 },
environmentalImpact: {
    treesEquivalent: Number, // 1 tree = ~21kg CO2/year
    carKmEquivalent: Number
}
```

#### 4.2.2 Environmental Goals & Challenges
- Monthly community challenges (e.g., "Save 1000kg CO2 this month")
- Personal environmental goals
- Visual progress indicators (trees planted equivalent, etc.)

---

### PHASE 3: Advanced Rewards & Gamification (Weeks 6-8)

#### 4.3.1 Points System
**Points Allocation:**
- Complete a route: 10 points
- Complete 5km: 25 points
- Complete 10km: 50 points
- Complete 25km: 150 points
- Daily ride streak: 5 points/day
- Safety report: 15 points
- Route review: 5 points

**Implementation:**
```javascript
// User Model Enhancement
points: { type: Number, default: 0 },
pointsHistory: [{
    source: String, // 'ride_completion', 'distance_milestone', etc.
    amount: Number,
    timestamp: Date
}],
currentStreak: { type: Number, default: 0 },
longestStreak: { type: Number, default: 0 }
```

#### 4.3.2 Enhanced Badge System
**New Badges:**
- **Environmental Champion**: Save 100kg CO2
- **Safety Advocate**: Report 10 safety incidents
- **Explorer**: Complete 10 different routes
- **Marathon Rider**: Complete 50km in one ride
- **Community Helper**: Write 20 route reviews
- **Weekly Warrior**: Ride 7 days in a row
- **Monthly Master**: Complete 20 rides in a month

**Implementation:**
- Badge categories (Distance, Environmental, Social, Consistency)
- Badge rarity levels (Bronze, Silver, Gold, Platinum)
- Badge display with icons and descriptions

#### 4.3.3 Leaderboards
- Global leaderboard (points, distance, CO2 saved)
- Monthly leaderboards
- Category-specific leaderboards
- Local/regional leaderboards (by city/area)

#### 4.3.4 Reward Redemption
- Partner with local businesses (cafes, bike shops, etc.)
- Points can be redeemed for discounts
- Digital certificates for achievements
- Social media shareable badges

---

### PHASE 4: Community Features (Weeks 9-11)

#### 4.4.1 Social Features
- User profiles with stats and badges
- Follow other cyclists
- Share rides and achievements
- Comment on routes and rides
- Create cycling groups/clubs

#### 4.4.2 Route Sharing
- Users can create and submit routes
- Community voting on route quality
- Route collections (e.g., "Best routes for beginners")
- Route challenges (complete all routes in a collection)

#### 4.4.3 Events & Challenges
- Community-organized cycling events
- City-wide challenges (e.g., "Cycle to Work Week")
- Team challenges
- Seasonal events

---

### PHASE 5: Analytics & City Planning Tools (Weeks 12-13)

#### 4.5.1 Admin Analytics Dashboard
- Most popular routes
- Safety incident hotspots
- User growth and engagement metrics
- Environmental impact summary
- Route usage patterns

#### 4.5.2 Data Export for City Planners
- CSV/JSON export of route usage data
- Safety incident reports
- Popular route requests
- Infrastructure recommendations

#### 4.5.3 Heatmaps
- Route popularity heatmap
- Safety incident heatmap
- User activity heatmap
- Infrastructure gap analysis

---

### PHASE 6: Mobile Optimization & PWA (Weeks 14-15)

#### 4.6.1 Progressive Web App (PWA)
- Offline route viewing
- Push notifications for challenges
- Install as mobile app
- Background location tracking

#### 4.6.2 Mobile-First Design
- Responsive design improvements
- Touch-optimized map controls
- Quick ride start/stop
- Voice navigation integration

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Current Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Google Maps API
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT
- **Database**: MongoDB

### 5.2 Additional Technologies Needed
- **Real-time**: Socket.io (for live tracking, notifications)
- **File Storage**: Multer + Cloudinary (for route images, profile pics)
- **Email**: Nodemailer (for notifications, password reset)
- **Analytics**: Custom analytics or Google Analytics
- **Push Notifications**: Web Push API or Firebase Cloud Messaging

### 5.3 Database Schema Enhancements

#### New Models Needed:
1. **Review Model**
```javascript
{
    route: ObjectId,
    user: ObjectId,
    rating: Number,
    comment: String,
    safetyIssues: [String],
    helpful: Number, // upvotes
    timestamp: Date
}
```

2. **SafetyIncident Model**
```javascript
{
    route: ObjectId,
    user: ObjectId,
    type: String, // 'hazard', 'accident', 'unsafe_condition'
    location: { lat: Number, lng: Number },
    description: String,
    severity: String, // 'low', 'medium', 'high', 'critical'
    status: String, // 'reported', 'investigating', 'resolved'
    timestamp: Date
}
```

3. **Challenge Model**
```javascript
{
    name: String,
    description: String,
    type: String, // 'distance', 'routes', 'streak', 'community'
    target: Number,
    startDate: Date,
    endDate: Date,
    participants: [ObjectId],
    rewards: {
        points: Number,
        badge: ObjectId
    }
}
```

4. **Reward Model**
```javascript
{
    name: String,
    description: String,
    pointsRequired: Number,
    type: String, // 'discount', 'badge', 'certificate'
    partner: String, // business name if applicable
    discountCode: String,
    expiryDate: Date,
    available: Boolean
}
```

---

## 6. IMPLEMENTATION TIMELINE

### Week 1-2: Foundation
- [ ] Enhance Route model with safety features
- [ ] Implement route reviews and ratings
- [ ] Add route filtering and search
- [ ] Create Review model and API endpoints

### Week 3: Safety Features
- [ ] Safety incident reporting system
- [ ] Safety rating aggregation
- [ ] Admin safety dashboard

### Week 4-5: Environmental Impact
- [ ] CO2 calculator implementation
- [ ] Environmental impact tracking
- [ ] Environmental goals and challenges
- [ ] Impact visualization on dashboard

### Week 6-7: Points System
- [ ] Points allocation logic
- [ ] Points history tracking
- [ ] Streak tracking
- [ ] Points display on dashboard

### Week 8: Enhanced Badges
- [ ] Expand badge system
- [ ] Badge categories and rarity
- [ ] Badge display improvements
- [ ] Badge achievement notifications

### Week 9-10: Leaderboards
- [ ] Global leaderboard
- [ ] Monthly leaderboards
- [ ] Category-specific leaderboards
- [ ] Leaderboard caching for performance

### Week 11: Community Features
- [ ] User profiles enhancement
- [ ] Social features (follow, share)
- [ ] Route sharing and collections
- [ ] Community challenges

### Week 12: Analytics
- [ ] Admin analytics dashboard
- [ ] Data export functionality
- [ ] Heatmap generation
- [ ] Usage pattern analysis

### Week 13-14: Mobile & PWA
- [ ] PWA implementation
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Mobile optimization

### Week 15: Testing & Deployment
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment and documentation

---

## 7. SUCCESS METRICS

### 7.1 User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average rides per user per month
- User retention rate (30-day, 90-day)

### 7.2 Environmental Impact
- Total CO2 saved (kg)
- Total distance cycled (km)
- Number of car trips replaced
- Trees equivalent planted

### 7.3 Community Growth
- Number of routes created
- Number of reviews submitted
- Safety incidents reported and resolved
- Community challenges completed

### 7.4 Safety Improvements
- Average route safety rating
- Safety incidents resolved
- Routes marked as safe
- User-reported safety improvements

---

## 8. RISK MANAGEMENT

### 8.1 Technical Risks
- **GPS accuracy issues**: Implement location smoothing algorithms
- **High server load**: Use caching, CDN, and database indexing
- **API rate limits**: Implement request throttling and caching

### 8.2 User Adoption Risks
- **Low initial user base**: Marketing campaign, partnerships with cycling clubs
- **Privacy concerns**: Clear privacy policy, opt-in location tracking
- **Battery drain**: Optimize location tracking frequency

### 8.3 Data Quality Risks
- **Inaccurate route data**: Admin moderation, user reporting
- **Fake reviews**: Verification system, moderation
- **Spam safety reports**: Rate limiting, admin review

---

## 9. FUTURE ENHANCEMENTS (Post-MVP)

1. **AI-Powered Route Recommendations**
   - Machine learning based on user preferences
   - Weather-aware route suggestions
   - Time-based route optimization

2. **Integration with Public Transport**
   - Combine cycling with buses/trains
   - Multi-modal route planning

3. **Bike Sharing Integration**
   - Connect with local bike-sharing services
   - Availability of shared bikes on routes

4. **Health Tracking**
   - Integration with fitness trackers
   - Calories burned, heart rate
   - Health goals and progress

5. **AR Navigation**
   - Augmented reality route guidance
   - Turn-by-turn navigation overlay

6. **Blockchain Rewards**
   - Token-based reward system
   - NFT badges for achievements

---

## 10. RESOURCES & REFERENCES

### 10.1 Research Papers
- "Cycling and the City: A Case Study of How Gendered, Ethnic and Class Identities Can Shape Good Transport Policy" (Journal of Transport Geography)
- "Gamification in Sustainable Mobility: A Systematic Review" (Sustainability Journal)
- "The Impact of Cycling Infrastructure on Cycling Behavior" (Transportation Research)

### 10.2 Similar Applications
- Strava (cycling and running app)
- Komoot (route planning)
- Citymapper (urban mobility)
- Bike Citizens (city cycling)

### 10.3 UN SDG Resources
- UN SDG 11: Sustainable Cities and Communities
- UN SDG 13: Climate Action
- UN Habitat: Urban Mobility

---

## 11. CONCLUSION

This project plan provides a comprehensive roadmap for developing a web application that promotes cycling as a sustainable mode of transportation. By combining safe route mapping, gamification, environmental impact tracking, and community features, the application will contribute to SDG 11 (Sustainable Cities) while engaging users through rewards and social features.

The phased implementation approach allows for iterative development, testing, and user feedback, ensuring the final product meets the needs of cyclists, city planners, and the broader community working toward sustainable urban mobility.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Project Status:** Planning Phase
