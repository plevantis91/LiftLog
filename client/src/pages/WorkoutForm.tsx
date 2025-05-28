import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWorkout } from '../contexts/WorkoutContext'
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Dumbbell,
  Clock,
  Target
} from 'lucide-react'

interface Exercise {
  name: string
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'other'
  sets: {
    reps: number
    weight: number
    duration?: number
    restTime?: number
    rpe?: number
    notes?: string
  }[]
}

const WorkoutForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { createWorkout, updateWorkout, fetchWorkout, loading } = useWorkout()
  
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    tags: [] as string[],
    duration: 0,
    exercises: [] as Exercise[]
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(id)

  useEffect(() => {
    if (isEditing && id) {
      fetchWorkout(id).then(workout => {
        setFormData({
          name: workout.name,
          notes: workout.notes || '',
          tags: workout.tags || [],
          duration: workout.duration || 0,
          exercises: workout.exercises
        })
      })
    }
  }, [id, isEditing])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const addExercise = () => {
    const newExercise: Exercise = {
      name: '',
      category: 'other',
      sets: [{ reps: 0, weight: 0 }]
    }
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }))
  }

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  const updateExercise = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }))
  }

  const addSet = (exerciseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? { ...exercise, sets: [...exercise.sets, { reps: 0, weight: 0 }] }
          : exercise
      )
    }))
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? { 
              ...exercise, 
              sets: exercise.sets.filter((_, j) => j !== setIndex) 
            }
          : exercise
      )
    }))
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) => 
                j === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required'
    }

    if (formData.exercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required'
    }

    formData.exercises.forEach((exercise, exerciseIndex) => {
      if (!exercise.name.trim()) {
        newErrors[`exercise_${exerciseIndex}_name`] = 'Exercise name is required'
      }
      
      exercise.sets.forEach((set, setIndex) => {
        if (set.reps <= 0) {
          newErrors[`exercise_${exerciseIndex}_set_${setIndex}_reps`] = 'Reps must be greater than 0'
        }
        if (set.weight < 0) {
          newErrors[`exercise_${exerciseIndex}_set_${setIndex}_weight`] = 'Weight cannot be negative'
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      
      const workoutData = {
        ...formData,
        date: new Date().toISOString()
      }

      if (isEditing && id) {
        await updateWorkout(id, workoutData)
      } else {
        await createWorkout(workoutData)
      }
      
      navigate('/workouts')
    } catch (error) {
      console.error('Failed to save workout:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/workouts')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Workout' : 'New Workout'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your workout details' : 'Log your training session'}
            </p>
          </div>
        </div>
        
        <button
          type="submit"
          form="workout-form"
          disabled={isSubmitting}
          className="btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </button>
      </div>

      <form id="workout-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Workout Details</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Workout Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g., Upper Body Strength"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className="mt-1 input"
                  placeholder="60"
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="mt-1 input"
                  placeholder="push, upper-body, heavy"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1 input"
                placeholder="How did the workout feel? Any observations..."
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
              <button
                type="button"
                onClick={addExercise}
                className="btn-outline flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </button>
            </div>
          </div>
          <div className="card-body">
            {errors.exercises && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-md">
                {errors.exercises}
              </div>
            )}

            {formData.exercises.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No exercises added yet</p>
                <button
                  type="button"
                  onClick={addExercise}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Exercise
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Exercise {exerciseIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExercise(exerciseIndex)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Exercise Name *
                        </label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(exerciseIndex, 'name', e.target.value)}
                          className={`input ${errors[`exercise_${exerciseIndex}_name`] ? 'input-error' : ''}`}
                          placeholder="e.g., Bench Press"
                        />
                        {errors[`exercise_${exerciseIndex}_name`] && (
                          <p className="mt-1 text-sm text-danger-600">
                            {errors[`exercise_${exerciseIndex}_name`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={exercise.category}
                          onChange={(e) => updateExercise(exerciseIndex, 'category', e.target.value)}
                          className="input"
                        >
                          <option value="chest">Chest</option>
                          <option value="back">Back</option>
                          <option value="shoulders">Shoulders</option>
                          <option value="arms">Arms</option>
                          <option value="legs">Legs</option>
                          <option value="core">Core</option>
                          <option value="cardio">Cardio</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Sets */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-700">Sets</h5>
                        <button
                          type="button"
                          onClick={() => addSet(exerciseIndex)}
                          className="btn-outline text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Set
                        </button>
                      </div>

                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="grid grid-cols-6 gap-2 items-center">
                            <div className="text-sm font-medium text-gray-700">
                              Set {setIndex + 1}
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500">Reps</label>
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                className={`input text-sm ${errors[`exercise_${exerciseIndex}_set_${setIndex}_reps`] ? 'input-error' : ''}`}
                                min="1"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500">Weight (kg)</label>
                              <input
                                type="number"
                                value={set.weight}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                className={`input text-sm ${errors[`exercise_${exerciseIndex}_set_${setIndex}_weight`] ? 'input-error' : ''}`}
                                min="0"
                                step="0.5"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500">RPE</label>
                              <input
                                type="number"
                                value={set.rpe || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', parseInt(e.target.value) || undefined)}
                                className="input text-sm"
                                min="1"
                                max="10"
                                placeholder="1-10"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500">Rest (min)</label>
                              <input
                                type="number"
                                value={set.restTime || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'restTime', parseInt(e.target.value) || undefined)}
                                className="input text-sm"
                                min="0"
                                placeholder="0"
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeSet(exerciseIndex, setIndex)}
                                className="p-1 text-danger-600 hover:text-danger-700"
                                disabled={exercise.sets.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default WorkoutForm
