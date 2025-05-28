const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'other']
  },
  sets: [{
    reps: {
      type: Number,
      required: true,
      min: 1
    },
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    duration: Number, // for time-based exercises (seconds)
    restTime: Number, // rest time after this set (seconds)
    rpe: { // Rate of Perceived Exertion (1-10)
      type: Number,
      min: 1,
      max: 10
    },
    notes: String
  }],
  totalVolume: Number, // calculated: sum of (reps * weight) for all sets
  maxWeight: Number, // highest weight used in this exercise
  averageRPE: Number // average RPE across all sets
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  name: {
    type: String,
    trim: true,
    default: 'Workout'
  },
  exercises: [exerciseSchema],
  duration: Number, // total workout duration in minutes
  notes: String,
  tags: [String], // e.g., ['push', 'upper-body', 'heavy']
  metrics: {
    totalVolume: Number, // sum of all exercise volumes
    totalSets: Number,
    totalReps: Number,
    averageRPE: Number,
    maxWeight: Number
  },
  recoveryFactors: {
    sleepHours: Number,
    sleepQuality: {
      type: Number,
      min: 1,
      max: 10
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    nutritionQuality: {
      type: Number,
      min: 1,
      max: 10
    },
    hydration: {
      type: Number,
      min: 1,
      max: 10
    },
    stepCount: Number,
    cardioMinutes: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate metrics before saving
workoutSchema.pre('save', function(next) {
  this.metrics.totalSets = this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  this.metrics.totalReps = this.exercises.reduce((total, exercise) => 
    total + exercise.sets.reduce((sum, set) => sum + set.reps, 0), 0);
  
  this.metrics.totalVolume = this.exercises.reduce((total, exercise) => 
    total + exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0), 0);
  
  this.metrics.maxWeight = Math.max(...this.exercises.map(ex => 
    Math.max(...ex.sets.map(set => set.weight))));
  
  // Calculate average RPE
  const allRPEs = this.exercises.flatMap(ex => ex.sets.map(set => set.rpe)).filter(rpe => rpe);
  this.metrics.averageRPE = allRPEs.length > 0 ? 
    allRPEs.reduce((sum, rpe) => sum + rpe, 0) / allRPEs.length : null;

  // Calculate exercise-level metrics
  this.exercises.forEach(exercise => {
    exercise.totalVolume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
    exercise.maxWeight = Math.max(...exercise.sets.map(set => set.weight));
    const rpes = exercise.sets.map(set => set.rpe).filter(rpe => rpe);
    exercise.averageRPE = rpes.length > 0 ? 
      rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length : null;
  });

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
