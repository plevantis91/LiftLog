import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Calendar, 
  Weight, 
  Ruler, 
  Target,
  Settings,
  Save,
  Lock,
  Trash2
} from 'lucide-react'

const Profile: React.FC = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    profile: {
      age: 0,
      weight: 0,
      height: 0,
      fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      goals: [] as string[]
    },
    preferences: {
      units: 'metric' as 'metric' | 'imperial',
      notifications: {
        recoveryReminders: true,
        workoutReminders: true
      }
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [deleteData, setDeleteData] = useState({
    password: ''
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      })
    }
  }, [user])

  const handleProfileChange = (field: string, value: any) => {
    const keys = field.split('.')
    setProfileData(prev => {
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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateProfile = () => {
    const newErrors: { [key: string]: string } = {}

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (profileData.profile.age && (profileData.profile.age < 13 || profileData.profile.age > 120)) {
      newErrors.age = 'Age must be between 13 and 120'
    }

    if (profileData.profile.weight && (profileData.profile.weight < 20 || profileData.profile.weight > 300)) {
      newErrors.weight = 'Weight must be between 20 and 300 kg'
    }

    if (profileData.profile.height && (profileData.profile.height < 100 || profileData.profile.height > 250)) {
      newErrors.height = 'Height must be between 100 and 250 cm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfile()) return

    try {
      setIsSubmitting(true)
      // await updateProfile(profileData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    try {
      setIsSubmitting(true)
      // await changePassword(passwordData)
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!deleteData.password) {
      setErrors({ password: 'Password is required for account deletion' })
      return
    }

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setIsSubmitting(true)
      // await deleteAccount(deleteData.password)
    } catch (error) {
      console.error('Failed to delete account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'preferences', name: 'Preferences', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-outline"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileSubmit}
                        disabled={isSubmitting}
                        className="btn-primary"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => handleProfileChange('username', e.target.value)}
                        disabled={!isEditing}
                        className={`input ${errors.username ? 'input-error' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-danger-600">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        disabled={!isEditing}
                        className={`input ${errors.email ? 'input-error' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Physical Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={profileData.profile.age || ''}
                          onChange={(e) => handleProfileChange('profile.age', parseInt(e.target.value) || 0)}
                          disabled={!isEditing}
                          className={`input ${errors.age ? 'input-error' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                          min="13"
                          max="120"
                        />
                        {errors.age && (
                          <p className="mt-1 text-sm text-danger-600">{errors.age}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={profileData.profile.weight || ''}
                          onChange={(e) => handleProfileChange('profile.weight', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          className={`input ${errors.weight ? 'input-error' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                          min="20"
                          max="300"
                          step="0.1"
                        />
                        {errors.weight && (
                          <p className="mt-1 text-sm text-danger-600">{errors.weight}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          value={profileData.profile.height || ''}
                          onChange={(e) => handleProfileChange('profile.height', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          className={`input ${errors.height ? 'input-error' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                          min="100"
                          max="250"
                          step="0.1"
                        />
                        {errors.height && (
                          <p className="mt-1 text-sm text-danger-600">{errors.height}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fitness Level
                      </label>
                      <select
                        value={profileData.profile.fitnessLevel}
                        onChange={(e) => handleProfileChange('profile.fitnessLevel', e.target.value)}
                        disabled={!isEditing}
                        className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                    {!isChangingPassword ? (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="btn-outline"
                      >
                        Change Password
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsChangingPassword(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                {isChangingPassword && (
                  <div className="card-body">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className={`input ${errors.currentPassword ? 'input-error' : ''}`}
                        />
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-danger-600">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className={`input ${errors.newPassword ? 'input-error' : ''}`}
                        />
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-danger-600">{errors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary"
                        >
                          {isSubmitting ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Delete Account */}
              <div className="card border-danger-200">
                <div className="card-header bg-danger-50">
                  <h3 className="text-lg font-medium text-danger-900">Delete Account</h3>
                </div>
                <div className="card-body">
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  {!isDeletingAccount ? (
                    <button
                      onClick={() => setIsDeletingAccount(true)}
                      className="btn-danger"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </button>
                  ) : (
                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter your password to confirm
                        </label>
                        <input
                          type="password"
                          value={deleteData.password}
                          onChange={(e) => setDeleteData({ password: e.target.value })}
                          className={`input ${errors.password ? 'input-error' : ''}`}
                          placeholder="Your current password"
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsDeletingAccount(false)}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-danger"
                        >
                          {isSubmitting ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Units
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="units"
                          value="metric"
                          checked={profileData.preferences.units === 'metric'}
                          onChange={(e) => handleProfileChange('preferences.units', e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">Metric (kg, cm)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="units"
                          value="imperial"
                          checked={profileData.preferences.units === 'imperial'}
                          onChange={(e) => handleProfileChange('preferences.units', e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">Imperial (lbs, ft/in)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Notifications
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.preferences.notifications.recoveryReminders}
                          onChange={(e) => handleProfileChange('preferences.notifications.recoveryReminders', e.target.checked)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">Recovery reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.preferences.notifications.workoutReminders}
                          onChange={(e) => handleProfileChange('preferences.notifications.workoutReminders', e.target.checked)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">Workout reminders</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
