import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkout } from '../contexts/WorkoutContext'
import { useRecovery } from '../contexts/RecoveryContext'
import { 
  Dumbbell, 
  Activity, 
  TrendingUp, 
  Clock, 
  Target,
  Plus,
  Calendar,
  BarChart3
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { stats, fetchStats, workouts, fetchWorkouts } = useWorkout()
  const { recommendations, fetchRecommendations } = useRecovery()
  const [recentWorkouts, setRecentWorkouts] = useState(workouts.slice(0, 3))

  useEffect(() => {
    fetchStats('30d')
    fetchWorkouts(1, 5)
    fetchRecommendations()
  }, [])

  useEffect(() => {
    setRecentWorkouts(workouts.slice(0, 3))
  }, [workouts])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your fitness progress and recovery</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/workouts/new"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workout
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Dumbbell className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Workouts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalWorkouts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalVolume ? Math.round(stats.totalVolume).toLocaleString() : 0} kg
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Duration</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.avgDuration ? Math.round(stats.avgDuration) : 0} min
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Max Weight</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.maxWeight || 0} kg
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Workouts</h3>
              <Link to="/workouts" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 text-primary-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{workout.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(workout.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {workout.metrics.totalVolume} kg
                      </p>
                      <p className="text-sm text-gray-500">
                        {workout.metrics.totalSets} sets
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No workouts yet</p>
                <Link to="/workouts/new" className="text-primary-600 hover:text-primary-500 text-sm">
                  Start your first workout
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Status */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recovery Status</h3>
              <Link to="/recovery" className="text-sm text-primary-600 hover:text-primary-500">
                View details
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className={`h-3 w-3 rounded-full bg-${recoveryStatus.color}-500 mr-3`}></div>
              <span className={`text-${recoveryStatus.color}-700 font-medium`}>
                {recoveryStatus.message}
              </span>
            </div>
            
            {recommendations && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Suggested Recovery Time</span>
                  <span className="font-medium">{recommendations.suggestedRecoveryTime}h</span>
                </div>
                
                {recommendations.focusAreas.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Focus Areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.focusAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {recommendations.warnings.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Warnings:</p>
                    <div className="space-y-1">
                      {recommendations.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-danger-600">
                          • {warning}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/workouts/new"
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-primary-900">Log Workout</p>
                <p className="text-sm text-primary-600">Record your training session</p>
              </div>
            </Link>
            
            <Link
              to="/recovery"
              className="flex items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
            >
              <Activity className="h-6 w-6 text-success-600 mr-3" />
              <div>
                <p className="font-medium text-success-900">Track Recovery</p>
                <p className="text-sm text-success-600">Log sleep, nutrition, stress</p>
              </div>
            </Link>
            
            <Link
              to="/workouts"
              className="flex items-center p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-warning-600 mr-3" />
              <div>
                <p className="font-medium text-warning-900">View Progress</p>
                <p className="text-sm text-warning-600">Analyze your performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
