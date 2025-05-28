const express = require('express');
const { body, validationResult } = require('express-validator');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all workouts for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const workouts = await Workout.find({ userId: req.user._id })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username');

    const total = await Workout.countDocuments({ userId: req.user._id });

    res.json({
      workouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalWorkouts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new workout
router.post('/', auth, [
  body('name').optional().trim().isLength({ max: 100 }),
  body('exercises').isArray().withMessage('Exercises must be an array'),
  body('exercises.*.name').notEmpty().withMessage('Exercise name is required'),
  body('exercises.*.category').isIn(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'other'])
    .withMessage('Invalid exercise category'),
  body('exercises.*.sets').isArray().withMessage('Sets must be an array'),
  body('exercises.*.sets.*.reps').isInt({ min: 1 }).withMessage('Reps must be at least 1'),
  body('exercises.*.sets.*.weight').isFloat({ min: 0 }).withMessage('Weight must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workoutData = {
      ...req.body,
      userId: req.user._id
    };

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Workout.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalVolume: { $sum: '$metrics.totalVolume' },
          totalSets: { $sum: '$metrics.totalSets' },
          totalReps: { $sum: '$metrics.totalReps' },
          avgDuration: { $avg: '$duration' },
          avgRPE: { $avg: '$metrics.averageRPE' },
          maxWeight: { $max: '$metrics.maxWeight' }
        }
      }
    ]);

    const result = stats[0] || {
      totalWorkouts: 0,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      avgDuration: 0,
      avgRPE: 0,
      maxWeight: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exercise progress
router.get('/progress/:exerciseName', auth, async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progress = await Workout.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate },
          'exercises.name': new RegExp(exerciseName, 'i')
        }
      },
      { $unwind: '$exercises' },
      {
        $match: {
          'exercises.name': new RegExp(exerciseName, 'i')
        }
      },
      {
        $project: {
          date: 1,
          'exercise': '$exercises',
          volume: { $sum: { $map: { input: '$exercises.sets', as: 'set', in: { $multiply: ['$$set.reps', '$$set.weight'] } } } },
          maxWeight: { $max: '$exercises.sets.weight' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
