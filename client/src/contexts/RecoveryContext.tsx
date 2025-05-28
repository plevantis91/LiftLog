import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface RecoveryFactors {
  sleep: {
    hours?: number
    quality?: number
  }
  nutrition: {
    quality?: number
    hydration?: number
  }
  stress: {
    level?: number
    workStress?: number
  }
  activity: {
    stepCount?: number
    cardioMinutes?: number
    activeMinutes?: number
  }
}

interface RecoveryRecommendations {
  suggestedRecoveryTime: number
  intensityModifier: number
  focusAreas: string[]
  warnings: string[]
}

interface Recovery {
  _id: string
  userId: string
  workoutId: string
  date: string
  factors: RecoveryFactors
  recoveryScore: number
  readinessScore: number
  recommendations: RecoveryRecommendations
  feedback?: {
    accuracy: number
    helpfulness: number
    comments?: string
  }
  createdAt: string
}

interface RecoveryContextType {
  recoveries: Recovery[]
  recommendations: RecoveryRecommendations | null
  averageFactors: RecoveryFactors | null
  loading: boolean
  error: string | null
  fetchRecoveries: (page?: number, limit?: number, startDate?: string, endDate?: string) => Promise<void>
  createRecovery: (recovery: Partial<Recovery>) => Promise<Recovery>
  updateRecovery: (id: string, recovery: Partial<Recovery>) => Promise<Recovery>
  fetchRecommendations: () => Promise<void>
  submitFeedback: (id: string, feedback: { accuracy: number; helpfulness: number; comments?: string }) => Promise<void>
}

const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined)

export const useRecovery = () => {
  const context = useContext(RecoveryContext)
  if (context === undefined) {
    throw new Error('useRecovery must be used within a RecoveryProvider')
  }
  return context
}

interface RecoveryProviderProps {
  children: ReactNode
}

export const RecoveryProvider: React.FC<RecoveryProviderProps> = ({ children }) => {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [recommendations, setRecommendations] = useState<RecoveryRecommendations | null>(null)
  const [averageFactors, setAverageFactors] = useState<RecoveryFactors | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecoveries = async (page = 1, limit = 10, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/recovery', {
        params: { page, limit, startDate, endDate }
      })
      
      setRecoveries(response.data.recoveries)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch recovery data')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createRecovery = async (recovery: Partial<Recovery>): Promise<Recovery> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/recovery', recovery)
      const newRecovery = response.data
      
      setRecoveries(prev => [newRecovery, ...prev])
      return newRecovery
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create recovery entry')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateRecovery = async (id: string, recovery: Partial<Recovery>): Promise<Recovery> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.put(`/recovery/${id}`, recovery)
      const updatedRecovery = response.data
      
      setRecoveries(prev => prev.map(r => r._id === id ? updatedRecovery : r))
      return updatedRecovery
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update recovery entry')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/recovery/recommendations')
      setRecommendations(response.data.recommendations)
      setAverageFactors(response.data.averageFactors)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch recommendations')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async (id: string, feedback: { accuracy: number; helpfulness: number; comments?: string }) => {
    try {
      setLoading(true)
      setError(null)
      
      await api.post(`/recovery/${id}/feedback`, feedback)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit feedback')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    recoveries,
    recommendations,
    averageFactors,
    loading,
    error,
    fetchRecoveries,
    createRecovery,
    updateRecovery,
    fetchRecommendations,
    submitFeedback
  }

  return (
    <RecoveryContext.Provider value={value}>
      {children}
    </RecoveryContext.Provider>
  )
}
