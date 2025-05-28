const request = require('supertest')
const app = require('../index')
const User = require('../models/User')
const Workout = require('../models/Workout')

describe('Workouts', () => {
  let authToken
  let userId

  beforeEach(async () => {
    await User.deleteMany({})
    await Workout.deleteMany({})

    // Create test user and get auth token
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    }

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData)

    authToken = registerResponse.body.token
    userId = registerResponse.body.user.id
  })

  describe('POST /api/workouts', () => {
    it('should create a new workout with valid data', async () => {
      const workoutData = {
        name: 'Upper Body Strength',
        exercises: [
          {
            name: 'Bench Press',
            category: 'chest',
            sets: [
              { reps: 10, weight: 60 },
              { reps: 8, weight: 70 },
              { reps: 6, weight: 80 }
            ]
          }
        ],
        duration: 60,
        notes: 'Great workout!'
      }

      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(workoutData.name)
      expect(response.body.exercises).toHaveLength(1)
      expect(response.body.metrics.totalVolume).toBe(10*60 + 8*70 + 6*80)
    })

    it('should not create workout without authentication', async () => {
      const workoutData = {
        name: 'Test Workout',
        exercises: []
      }

      await request(app)
        .post('/api/workouts')
        .send(workoutData)
        .expect(401)
    })

    it('should not create workout with invalid exercise data', async () => {
      const workoutData = {
        name: 'Test Workout',
        exercises: [
          {
            name: '', // Empty name
            category: 'chest',
            sets: [
              { reps: 0, weight: -10 } // Invalid reps and weight
            ]
          }
        ]
      }

      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData)
        .expect(400)

      expect(response.body).toHaveProperty('errors')
    })
  })

  describe('GET /api/workouts', () => {
    beforeEach(async () => {
      // Create test workouts
      const workouts = [
        {
          userId,
          name: 'Workout 1',
          date: new Date('2023-01-01'),
          exercises: [{ name: 'Squat', category: 'legs', sets: [{ reps: 10, weight: 100 }] }]
        },
        {
          userId,
          name: 'Workout 2',
          date: new Date('2023-01-02'),
          exercises: [{ name: 'Deadlift', category: 'back', sets: [{ reps: 5, weight: 150 }] }]
        }
      ]

      await Workout.insertMany(workouts)
    })

    it('should get user workouts with pagination', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('workouts')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.workouts).toHaveLength(2)
    })

    it('should not get workouts without authentication', async () => {
      await request(app)
        .get('/api/workouts')
        .expect(401)
    })
  })

  describe('GET /api/workouts/stats/overview', () => {
    beforeEach(async () => {
      // Create test workouts with metrics
      const workouts = [
        {
          userId,
          name: 'Workout 1',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          exercises: [{ name: 'Squat', category: 'legs', sets: [{ reps: 10, weight: 100 }] }],
          duration: 60
        },
        {
          userId,
          name: 'Workout 2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          exercises: [{ name: 'Deadlift', category: 'back', sets: [{ reps: 5, weight: 150 }] }],
          duration: 45
        }
      ]

      await Workout.insertMany(workouts)
    })

    it('should get workout statistics', async () => {
      const response = await request(app)
        .get('/api/workouts/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('totalWorkouts', 2)
      expect(response.body).toHaveProperty('totalVolume')
      expect(response.body).toHaveProperty('avgDuration')
    })
  })
})
