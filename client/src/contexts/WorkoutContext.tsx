import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface Exercise {
  _id?: string
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
  totalVolume?: number
  maxWeight?: number
  averageRPE?: number
}

interface Workout {
  _id: string
  userId: string
  date: string
  name: string
  exercises: Exercise[]
  duration?: number
  notes?: string
  tags?: string[]
  metrics: {
    totalVolume: number
    totalSets: number
    totalReps: number
    averageRPE?: number
    maxWeight: number
  }
  recoveryFactors?: {
    sleepHours?: number
    sleepQuality?: number
    stressLevel?: number
    nutritionQuality?: number
    hydration?: number
    stepCount?: number
    cardioMinutes?: number
  }
  createdAt: string
  updatedAt: string
}

interface WorkoutStats {
  totalWorkouts: number
  totalVolume: number
  totalSets: number
  totalReps: number
  avgDuration: number
  avgRPE: number
  maxWeight: number
}

interface WorkoutContextType {
  workouts: Workout[]
  stats: WorkoutStats | null
  loading: boolean
  error: string | null
  fetchWorkouts: (page?: number, limit?: number) => Promise<void>
  fetchWorkout: (id: string) => Promise<Workout>
  createWorkout: (workout: Partial<Workout>) => Promise<Workout>
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<Workout>
  deleteWorkout: (id: string) => Promise<void>
  fetchStats: (period?: string) => Promise<void>
  fetchProgress: (exerciseName: string, period?: string) => Promise<any[]>
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export const useWorkout = () => {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}

interface WorkoutProviderProps {
  children: ReactNode
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkouts = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/workouts', {
        params: { page, limit }
      })
      
      setWorkouts(response.data.workouts)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch workouts')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkout = async (id: string): Promise<Workout> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/workouts/${id}`)
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch workout')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createWorkout = async (workout: Partial<Workout>): Promise<Workout> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/workouts', workout)
      const newWorkout = response.data
      
      setWorkouts(prev => [newWorkout, ...prev])
      return newWorkout
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create workout')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateWorkout = async (id: string, workout: Partial<Workout>): Promise<Workout> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.put(`/workouts/${id}`, workout)
      const updatedWorkout = response.data
      
      setWorkouts(prev => prev.map(w => w._id === id ? updatedWorkout : w))
      return updatedWorkout
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update workout')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkout = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await api.delete(`/workouts/${id}`)
      setWorkouts(prev => prev.filter(w => w._id !== id))
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete workout')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (period = '30d') => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/workouts/stats/overview', {
        params: { period }
      })
      
      setStats(response.data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch stats')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async (exerciseName: string, period = '30d') => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/workouts/progress/${exerciseName}`, {
        params: { period }
      })
      
      return response.data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch progress')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    workouts,
    stats,
    loading,
    error,
    fetchWorkouts,
    fetchWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    fetchStats,
    fetchProgress
  }

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  )
}
