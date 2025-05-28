# LiftLog - Intelligent Fitness Tracking

LiftLog is a comprehensive fitness web application designed to track strength training sessions and intelligently suggest optimal recovery periods based on individual performance and lifestyle factors. It allows users to log their sets, reps, and weights, while also factoring in step count, sleep quality, and cardio activity.

## Features

### 🏋️ Workout Tracking
- **Comprehensive Exercise Logging**: Track sets, reps, weights, RPE (Rate of Perceived Exertion), and rest times
- **Exercise Categories**: Organize exercises by muscle groups (chest, back, shoulders, arms, legs, core, cardio)
- **Workout Analytics**: View total volume, sets, reps, and performance metrics
- **Progress Tracking**: Monitor strength gains and exercise progression over time

### 🧠 Intelligent Recovery System
- **Recovery Factor Tracking**: Monitor sleep quality, nutrition, hydration, stress levels, and activity
- **AI-Powered Recommendations**: Get personalized recovery time suggestions based on workout intensity and lifestyle factors
- **Recovery Scoring**: Receive readiness scores to optimize training frequency
- **Warning System**: Alerts for overtraining risk and recovery concerns

### 📊 Analytics & Insights
- **Performance Dashboard**: Overview of training volume, frequency, and progress
- **Exercise Progress**: Track strength gains for individual exercises
- **Recovery Trends**: Monitor recovery patterns and lifestyle factors
- **Training Statistics**: Comprehensive metrics and performance analysis

### 👤 User Management
- **Secure Authentication**: JWT-based authentication with password hashing
- **Profile Management**: Track age, weight, height, fitness level, and goals
- **Preferences**: Customizable units (metric/imperial) and notification settings
- **Data Privacy**: Secure user data handling and storage

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** and **Helmet** for security

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LiftLog
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/liftlog
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 5173).

### Database Setup

The application uses MongoDB. Make sure you have MongoDB running locally or provide a connection string to a cloud MongoDB instance.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Workouts
- `GET /api/workouts` - Get user workouts (paginated)
- `GET /api/workouts/:id` - Get specific workout
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/stats/overview` - Get workout statistics
- `GET /api/workouts/progress/:exerciseName` - Get exercise progress

### Recovery
- `GET /api/recovery` - Get recovery data
- `POST /api/recovery` - Create recovery entry
- `PUT /api/recovery/:id` - Update recovery entry
- `GET /api/recovery/recommendations` - Get AI recommendations
- `POST /api/recovery/:id/feedback` - Submit feedback on recommendations

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account

## Project Structure

```
LiftLog/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── package.json           # Root package.json
└── README.md
```

## Key Features Implementation

### Intelligent Recovery Algorithm
The recovery system analyzes multiple factors:
- **Sleep Quality & Duration**: Primary recovery factor
- **Nutrition & Hydration**: Fuel for recovery
- **Stress Levels**: Mental and physical stress impact
- **Activity Levels**: Daily movement and cardio
- **Workout Intensity**: RPE and volume analysis

### Recovery Scoring
- **Recovery Score**: 0-100 based on lifestyle factors
- **Readiness Score**: Training readiness assessment
- **Recommendations**: Personalized recovery time and intensity modifications
- **Warnings**: Overtraining and recovery concern alerts

### Data Models
- **User**: Profile, preferences, authentication
- **Workout**: Exercises, sets, metrics, recovery factors
- **Recovery**: Lifestyle factors, scores, recommendations, feedback

## Development

### Running Tests
```bash
cd server
npm test
```

### Building for Production
```bash
cd client
npm run build
```

### Code Quality
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Wearable device integration
- [ ] Social features and challenges
- [ ] Advanced analytics and machine learning
- [ ] Nutrition tracking integration
- [ ] Video exercise demonstrations
- [ ] Workout plan templates
- [ ] Export data functionality

## Support

For support and questions, please open an issue in the repository or contact the development team.
