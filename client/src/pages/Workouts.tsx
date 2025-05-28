import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkout } from '../contexts/WorkoutContext'
import { 
  Plus, 
  Dumbbell, 
  Calendar, 
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react'

const Workouts: React.FC = () => {
  const { workouts, loading, fetchWorkouts } = useWorkout()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchWorkouts(currentPage, 10)
  }, [currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.exercises.some(exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
        break
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'volume':
        aValue = a.metrics.totalVolume
        bValue = b.metrics.totalVolume
        break
      case 'duration':
        aValue = a.duration || 0
        bValue = b.duration || 0
        break
      default:
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        // await deleteWorkout(id)
        // Refresh the list
        fetchWorkouts(currentPage, 10)
      } catch (error) {
        console.error('Failed to delete workout:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600">Track and analyze your training sessions</p>
        </div>
        <Link
          to="/workouts/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Workout
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts or exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="volume">Sort by Volume</option>
                <option value="duration">Sort by Duration</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-outline flex items-center"
              >
                <TrendingUp className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : sortedWorkouts.length > 0 ? (
        <div className="space-y-4">
          {sortedWorkouts.map((workout) => (
            <div key={workout._id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Dumbbell className="h-5 w-5 text-primary-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                      {workout.tags && workout.tags.length > 0 && (
                        <div className="ml-3 flex gap-1">
                          {workout.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(workout.date)} at {formatTime(workout.date)}</span>
                      {workout.duration && (
                        <>
                          <Clock className="h-4 w-4 ml-4 mr-1" />
                          <span>{workout.duration} minutes</span>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Total Volume</p>
                        <p className="font-semibold text-gray-900">
                          {workout.metrics.totalVolume.toLocaleString()} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sets</p>
                        <p className="font-semibold text-gray-900">{workout.metrics.totalSets}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reps</p>
                        <p className="font-semibold text-gray-900">{workout.metrics.totalReps}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Max Weight</p>
                        <p className="font-semibold text-gray-900">{workout.metrics.maxWeight} kg</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Exercises ({workout.exercises.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.slice(0, 5).map((exercise, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                          >
                            {exercise.name}
                          </span>
                        ))}
                        {workout.exercises.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{workout.exercises.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {workout.notes && (
                      <p className="text-sm text-gray-600 italic">"{workout.notes}"</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/workouts/${workout._id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit workout"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(workout._id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start tracking your fitness journey today.'}
            </p>
            <Link
              to="/workouts/new"
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workouts
