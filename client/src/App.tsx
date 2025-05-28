import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { RecoveryProvider } from './contexts/RecoveryContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import WorkoutForm from './pages/WorkoutForm'
import Recovery from './pages/Recovery'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <RecoveryProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="workouts" element={<Workouts />} />
                  <Route path="workouts/new" element={<WorkoutForm />} />
                  <Route path="workouts/:id/edit" element={<WorkoutForm />} />
                  <Route path="recovery" element={<Recovery />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </RecoveryProvider>
      </WorkoutProvider>
    </AuthProvider>
  )
}

export default App
