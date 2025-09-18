# Database Schema Documentation

## Collections

### 1. interviews
Stores interview session data
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to user
  jobTitle: String,
  companyName: String,
  interviewType: String, // 'technical', 'behavioral', 'mixed', 'dsa'
  experienceLevel: String, // 'entry', 'mid', 'senior'
  status: String, // 'ready', 'in-progress', 'completed'
  createdAt: Date,
  completedAt: Date, // Set when interview is completed
  performanceId: ObjectId, // Reference to performance document
  // ... other interview fields
}
```

### 2. performances (NEW)
Stores detailed performance analytics for completed interviews
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to user
  interviewId: ObjectId, // Reference to interview
  jobTitle: String,
  companyName: String,
  interviewType: String,
  experienceLevel: String,
  completedAt: Date,
  
  // Performance Metrics
  totalQuestions: Number,
  correctAnswers: Number,
  score: Number, // Overall score (0-100)
  timeSpent: Number, // Time in minutes
  
  // Detailed Feedback
  feedback: {
    overall: String, // Overall assessment
    strengths: [String], // Array of strengths
    improvements: [String], // Areas for improvement
    recommendations: [String] // Actionable recommendations
  },
  
  // Round-wise Performance
  roundResults: [{
    roundType: String, // 'technical', 'behavioral', 'dsa', 'mixed'
    score: Number, // Round score (0-100)
    questionsAnswered: Number,
    totalQuestions: Number,
    timeSpent: Number // Time spent on this round
  }]
}
```

## API Endpoints

### Performance Stats
- **GET** `/api/performance-stats` - Fetch user's performance history and statistics
- **POST** `/api/save-performance` - Save performance data after interview completion

### Interview Management
- **GET** `/api/user-interviews` - Fetch active interviews (excludes completed ones)
- **DELETE** `/api/delete-interview` - Delete an interview

## Performance Analytics Features

### 1. Dashboard Integration
- **Performance Stats Button** - Links to `/performance` page
- **Completed Interview Count** - Shows in dashboard stats
- **Active vs Completed** - Separates ongoing and finished interviews

### 2. Performance Tracking
- **Overall Score Tracking** - Tracks improvement over time
- **Round-wise Analysis** - Performance by interview type
- **Time Management** - Tracks time spent per interview
- **Trend Analysis** - Shows improvement/decline patterns

### 3. Detailed Feedback Storage
- **Strengths & Weaknesses** - Categorized feedback
- **Actionable Recommendations** - Specific improvement suggestions
- **Company-specific Insights** - Tailored advice per company

### 4. Export & Analytics
- **CSV Export** - Download performance history
- **Filtering** - By interview type, company, date range
- **Search** - Find specific interviews
- **Detailed View** - Modal with comprehensive feedback

## Data Flow

1. **Interview Creation** → `interviews` collection (status: 'ready')
2. **Interview Start** → Update status to 'in-progress'
3. **Interview Completion** → Redirect to feedback page
4. **Feedback Page Load** → `PerformanceSaver` component saves to `performances` collection
5. **Interview Status Update** → Set status to 'completed', add `performanceId`
6. **Dashboard View** → Shows only non-completed interviews
7. **Performance Page** → Shows all completed interviews with analytics

## Benefits

✅ **Comprehensive Tracking** - Every interview is tracked with detailed metrics
✅ **Progress Monitoring** - Users can see improvement over time  
✅ **Actionable Insights** - Specific feedback for improvement
✅ **Clean Dashboard** - Completed interviews don't clutter active list
✅ **Data Export** - Users can export their performance data
✅ **Trend Analysis** - Identify strengths and weaknesses patterns