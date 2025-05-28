const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Recovery factors from the day
  factors: {
    sleep: {
      hours: Number,
      quality: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    nutrition: {
      quality: {
        type: Number,
        min: 1,
        max: 10
      },
      hydration: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    stress: {
      level: {
        type: Number,
        min: 1,
        max: 10
      },
      workStress: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    activity: {
      stepCount: Number,
      cardioMinutes: Number,
      activeMinutes: Number
    }
  },
  // Calculated recovery metrics
  recoveryScore: {
    type: Number,
    min: 0,
    max: 100
  },
  readinessScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // AI-generated recommendations
  recommendations: {
    suggestedRecoveryTime: Number, // hours
    intensityModifier: {
      type: Number,
      min: 0.5,
      max: 1.5
    },
    focusAreas: [String], // e.g., ['sleep', 'nutrition', 'stress']
    warnings: [String] // e.g., ['overtraining risk', 'poor sleep quality']
  },
  // User feedback on recommendations
  feedback: {
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate recovery score before saving
recoverySchema.pre('save', function(next) {
  const factors = this.factors;
  let score = 0;
  let totalWeight = 0;

  // Sleep quality (30% weight)
  if (factors.sleep && factors.sleep.quality) {
    score += factors.sleep.quality * 30;
    totalWeight += 30;
  }

  // Sleep duration (20% weight)
  if (factors.sleep && factors.sleep.hours) {
    const sleepScore = Math.min(10, Math.max(0, (factors.sleep.hours - 4) * 2));
    score += sleepScore * 20;
    totalWeight += 20;
  }

  // Nutrition quality (20% weight)
  if (factors.nutrition && factors.nutrition.quality) {
    score += factors.nutrition.quality * 20;
    totalWeight += 20;
  }

  // Hydration (10% weight)
  if (factors.nutrition && factors.nutrition.hydration) {
    score += factors.nutrition.hydration * 10;
    totalWeight += 10;
  }

  // Stress level (20% weight) - inverted (lower stress = higher score)
  if (factors.stress && factors.stress.level) {
    score += (11 - factors.stress.level) * 20;
    totalWeight += 20;
  }

  this.recoveryScore = totalWeight > 0 ? Math.round(score / totalWeight) : 50;
  
  // Calculate readiness score (similar but with different weights)
  this.readinessScore = this.recoveryScore; // Simplified for now
  
  next();
});

module.exports = mongoose.model('Recovery', recoverySchema);
