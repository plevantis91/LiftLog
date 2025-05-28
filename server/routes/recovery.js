const express = require('express');
const { body, validationResult } = require('express-validator');
const Recovery = require('../models/Recovery');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const router = express.Router();

// Get recovery data for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { userId: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const recoveries = await Recovery.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('workoutId', 'name date exercises');

    const total = await Recovery.countDocuments(filter);

    res.json({
      recoveries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecoveries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get recovery data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create recovery entry
router.post('/', auth, [
  body('workoutId').isMongoId().withMessage('Valid workout ID is required'),
  body('factors.sleep.hours').optional().isFloat({ min: 0, max: 24 }),
  body('factors.sleep.quality').optional().isInt({ min: 1, max: 10 }),
  body('factors.nutrition.quality').optional().isInt({ min: 1, max: 10 }),
  body('factors.nutrition.hydration').optional().isInt({ min: 1, max: 10 }),
  body('factors.stress.level').optional().isInt({ min: 1, max: 10 }),
  body('factors.activity.stepCount').optional().isInt({ min: 0 }),
  body('factors.activity.cardioMinutes').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify workout belongs to user
    const workout = await Workout.findOne({ 
      _id: req.body.workoutId, 
      userId: req.user._id 
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const recoveryData = {
      ...req.body,
      userId: req.user._id
    };

    const recovery = new Recovery(recoveryData);
    await recovery.save();

    res.status(201).json(recovery);
  } catch (error) {
    console.error('Create recovery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recovery entry
router.put('/:id', auth, async (req, res) => {
  try {
    const recovery = await Recovery.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!recovery) {
      return res.status(404).json({ message: 'Recovery entry not found' });
    }

    res.json(recovery);
  } catch (error) {
    console.error('Update recovery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recovery recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get recent workouts and recovery data
    const recentWorkouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    const recentRecoveries = await Recovery.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Calculate average recovery factors
    const avgFactors = {
      sleep: { hours: 0, quality: 0 },
      nutrition: { quality: 0, hydration: 0 },
      stress: { level: 0 },
      activity: { stepCount: 0, cardioMinutes: 0 }
    };

    if (recentRecoveries.length > 0) {
      const totals = recentRecoveries.reduce((acc, recovery) => {
        const factors = recovery.factors;
        if (factors.sleep) {
          acc.sleep.hours += factors.sleep.hours || 0;
          acc.sleep.quality += factors.sleep.quality || 0;
        }
        if (factors.nutrition) {
          acc.nutrition.quality += factors.nutrition.quality || 0;
          acc.nutrition.hydration += factors.nutrition.hydration || 0;
        }
        if (factors.stress) {
          acc.stress.level += factors.stress.level || 0;
        }
        if (factors.activity) {
          acc.activity.stepCount += factors.activity.stepCount || 0;
          acc.activity.cardioMinutes += factors.activity.cardioMinutes || 0;
        }
        return acc;
      }, { sleep: { hours: 0, quality: 0 }, nutrition: { quality: 0, hydration: 0 }, stress: { level: 0 }, activity: { stepCount: 0, cardioMinutes: 0 } });

      const count = recentRecoveries.length;
      avgFactors.sleep.hours = totals.sleep.hours / count;
      avgFactors.sleep.quality = totals.sleep.quality / count;
      avgFactors.nutrition.quality = totals.nutrition.quality / count;
      avgFactors.nutrition.hydration = totals.nutrition.hydration / count;
      avgFactors.stress.level = totals.stress.level / count;
      avgFactors.activity.stepCount = totals.activity.stepCount / count;
      avgFactors.activity.cardioMinutes = totals.activity.cardioMinutes / count;
    }

    // Generate recommendations based on patterns
    const recommendations = {
      suggestedRecoveryTime: 48, // Default 48 hours
      intensityModifier: 1.0,
      focusAreas: [],
      warnings: []
    };

    // Analyze sleep patterns
    if (avgFactors.sleep.hours < 7) {
      recommendations.focusAreas.push('sleep');
      recommendations.warnings.push('Insufficient sleep detected');
      recommendations.suggestedRecoveryTime += 12;
    }

    if (avgFactors.sleep.quality < 6) {
      recommendations.focusAreas.push('sleep_quality');
      recommendations.warnings.push('Poor sleep quality detected');
    }

    // Analyze stress levels
    if (avgFactors.stress.level > 7) {
      recommendations.focusAreas.push('stress');
      recommendations.warnings.push('High stress levels detected');
      recommendations.intensityModifier *= 0.8;
    }

    // Analyze nutrition
    if (avgFactors.nutrition.quality < 6) {
      recommendations.focusAreas.push('nutrition');
      recommendations.warnings.push('Poor nutrition quality detected');
    }

    if (avgFactors.nutrition.hydration < 6) {
      recommendations.focusAreas.push('hydration');
      recommendations.warnings.push('Poor hydration detected');
    }

    // Analyze activity levels
    if (avgFactors.activity.stepCount < 5000) {
      recommendations.focusAreas.push('activity');
      recommendations.warnings.push('Low daily activity detected');
    }

    res.json({
      recommendations,
      averageFactors: avgFactors,
      recentWorkouts: recentWorkouts.length,
      recentRecoveries: recentRecoveries.length
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit feedback on recovery recommendations
router.post('/:id/feedback', auth, [
  body('accuracy').isInt({ min: 1, max: 5 }).withMessage('Accuracy must be between 1 and 5'),
  body('helpfulness').isInt({ min: 1, max: 5 }).withMessage('Helpfulness must be between 1 and 5'),
  body('comments').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recovery = await Recovery.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { feedback: req.body },
      { new: true }
    );

    if (!recovery) {
      return res.status(404).json({ message: 'Recovery entry not found' });
    }

    res.json({ message: 'Feedback submitted successfully', recovery });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
