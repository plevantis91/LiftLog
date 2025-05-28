import React, { useEffect, useState } from 'react'
import { useRecovery } from '../contexts/RecoveryContext'
import { useWorkout } from '../contexts/WorkoutContext'
import { 
  Activity, 
  Moon, 
  Utensils, 
  Heart, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'

const Recovery: React.FC = () => {
  const { 
    recommendations, 
    averageFactors, 
    loading, 
    fetchRecommendations,
    createRecovery,
    fetchRecoveries 
  } = useRecovery()
  const { workouts, fetchWorkouts } = useWorkout()
  
  const [recoveryData, setRecoveryData] = useState({
    workoutId: '',
    factors: {
      sleep: { hours: 0, quality: 0 },
      nutrition: { quality: 0, hydration: 0 },
      stress: { level: 0, workStress: 0 },
      activity: { stepCount: 0, cardioMinutes: 0, activeMinutes: 0 }
    }
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchRecommendations()
    fetchWorkouts(1, 10)
  }, [])

  const handleInputChange = (path: string, value: number) => {
    const keys = path.split('.')
    setRecoveryData(prev => {
      const newData = { ...prev }
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      await createRecovery(recoveryData)
      setShowForm(false)
      setRecoveryData({
        workoutId: '',
        factors: {
          sleep: { hours: 0, quality: 0 },
          nutrition: { quality: 0, hydration: 0 },
          stress: { level: 0, workStress: 0 },
          activity: { stepCount: 0, cardioMinutes: 0, activeMinutes: 0 }
        }
      })
      fetchRecommendations()
    } catch (error) {
      console.error('Failed to submit recovery data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRecoveryStatus = () => {
    if (!recommendations) return { status: 'unknown', color: 'gray', message: 'No data available' }
    
    const { suggestedRecoveryTime, warnings } = recommendations
    
    if (warnings.length > 0) {
      return { status: 'poor', color: 'danger', message: 'Recovery needs attention' }
    } else if (suggestedRecoveryTime > 48) {
      return { status: 'moderate', color: 'warning', message: 'Extended recovery recommended' }
    } else {
      return { status: 'good', color: 'success', message: 'Recovery on track' }
    }
  }

  const recoveryStatus = getRecoveryStatus()

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-600'
    if (score >= 6) return 'text-warning-600'
    return 'text-danger-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-success-100'
    if (score >= 6) return 'bg-warning-100'
    return 'bg-danger-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recovery Tracking</h1>
          <p className="text-gray-600">Monitor your recovery factors and get intelligent recommendations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Activity className="h-4 w-4 mr-2" />
          Log Recovery Data
        </button>
      </div>

      {/* Recovery Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Current Recovery Status</h3>
            </div>
            <div className="card-body">
              <div className="flex items-center mb-6">
                <div className={`h-4 w-4 rounded-full bg-${recoveryStatus.color}-500 mr-3`}></div>
                <span className={`text-${recoveryStatus.color}-700 font-medium text-lg`}>
                  {recoveryStatus.message}
                </span>
              </div>
              
              {recommendations && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Suggested Recovery Time</span>
                      <span className="font-semibold text-gray-900">
                        {recommendations.suggestedRecoveryTime} hours
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Intensity Modifier</span>
                      <span className="font-semibold text-gray-900">
                        {recommendations.intensityModifier}x
                      </span>
                    </div>
                  </div>
                  
                  {recommendations.focusAreas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendations.focusAreas.map((area, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-warning-100 text-warning-800 text-sm rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recommendations.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Warnings</h4>
                      <div className="space-y-2">
                        {recommendations.warnings.map((warning, index) => (
                          <div key={index} className="flex items-center p-3 bg-danger-50 border border-danger-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-danger-600 mr-2" />
                            <span className="text-sm text-danger-700">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recovery Factors Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recovery Factors</h3>
          </div>
          <div className="card-body">
            {averageFactors ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Moon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Sleep</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {averageFactors.sleep?.hours?.toFixed(1) || 0}h
                    </p>
                    <p className={`text-xs ${getScoreColor(averageFactors.sleep?.quality || 0)}`}>
                      Quality: {averageFactors.sleep?.quality?.toFixed(1) || 0}/10
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Utensils className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Nutrition</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getScoreColor(averageFactors.nutrition?.quality || 0)}`}>
                      {averageFactors.nutrition?.quality?.toFixed(1) || 0}/10
                    </p>
                    <p className="text-xs text-gray-500">
                      Hydration: {averageFactors.nutrition?.hydration?.toFixed(1) || 0}/10
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Stress</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getScoreColor(10 - (averageFactors.stress?.level || 0))}`}>
                      {averageFactors.stress?.level?.toFixed(1) || 0}/10
                    </p>
                    <p className="text-xs text-gray-500">Lower is better</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600">Activity</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {averageFactors.activity?.stepCount?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500">steps</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recovery data yet</p>
                <p className="text-sm text-gray-400">Start logging your recovery factors</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recovery Data Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Log Recovery Data</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Workout
                  </label>
                  <select
                    value={recoveryData.workoutId}
                    onChange={(e) => setRecoveryData(prev => ({ ...prev, workoutId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Choose a workout...</option>
                    {workouts.map(workout => (
                      <option key={workout._id} value={workout._id}>
                        {workout.name} - {new Date(workout.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sleep */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Moon className="h-5 w-5 text-blue-600 mr-2" />
                      Sleep
                    </h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hours of Sleep</label>
                      <input
                        type="number"
                        value={recoveryData.factors.sleep.hours}
                        onChange={(e) => handleInputChange('factors.sleep.hours', parseFloat(e.target.value) || 0)}
                        className="input"
                        min="0"
                        max="24"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sleep Quality (1-10)</label>
                      <input
                        type="number"
                        value={recoveryData.factors.sleep.quality}
                        onChange={(e) => handleInputChange('factors.sleep.quality', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Utensils className="h-5 w-5 text-green-600 mr-2" />
                      Nutrition
                    </h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nutrition Quality (1-10)</label>
                      <input
                        type="number"
                        value={recoveryData.factors.nutrition.quality}
                        onChange={(e) => handleInputChange('factors.nutrition.quality', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hydration (1-10)</label>
                      <input
                        type="number"
                        value={recoveryData.factors.nutrition.hydration}
                        onChange={(e) => handleInputChange('factors.nutrition.hydration', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {/* Stress */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Heart className="h-5 w-5 text-red-600 mr-2" />
                      Stress
                    </h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Stress Level (1-10)</label>
                      <input
                        type="number"
                        value={recoveryData.factors.stress.level}
                        onChange={(e) => handleInputChange('factors.stress.level', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Work Stress (1-10)</label>
                      <input
                        type="number"
                        value={recoveryData.factors.stress.workStress}
                        onChange={(e) => handleInputChange('factors.stress.workStress', parseInt(e.target.value) || 0)}
                        className="input"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      Activity
                    </h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Step Count</label>
                      <input
                        type="number"
                        value={recoveryData.factors.activity.stepCount}
                        onChange={(e) => handleInputChange('factors.activity.stepCount', parseInt(e.target.value) || 0)}
                        className="input"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Cardio Minutes</label>
                      <input
                        type="number"
                        value={recoveryData.factors.activity.cardioMinutes}
                        onChange={(e) => handleInputChange('factors.activity.cardioMinutes', parseInt(e.target.value) || 0)}
                        className="input"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Recovery Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recovery
