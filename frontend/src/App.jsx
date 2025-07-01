import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import EnhancedDashboard from './components/EnhancedDashboard'
import ApiService from './services/api.js'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(true)

  useEffect(() => {
    // Initialize API connection
    const initializeApp = async () => {
      try {
        console.log('🚀 Gold Trading Dashboard Initialized')
        await ApiService.testConnection()
        setIsConnected(true)
      } catch (err) {
        console.error('❌ Error initializing app:', err)
        setError(err.message)
      }
    }

    initializeApp()
  }, [])

  return (
    <div className='min-h-screen flex flex-col bg-gray-900'>
      <header className='glass-card border-b border-white/10 px-4 py-4 lg:px-8 flex flex-col lg:flex-row justify-between items-center gap-4'>
        <h1 className='text-2xl lg:text-3xl font-bold gradient-text'>🏆 Gold Trading Bot Dashboard</h1>
        <div className='flex items-center gap-4'>
          {/* Dashboard Toggle */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setUseEnhancedDashboard(!useEnhancedDashboard)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${useEnhancedDashboard ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {useEnhancedDashboard ? 'Enhanced' : 'Legacy'}
            </button>
          </div>

          {/* Connection Status */}
          <div className='flex items-center gap-2'>
            <span className={`status-dot ${isConnected ? 'active' : 'inactive'}`}></span>
            <span className='text-sm lg:text-base'>{isConnected ? 'System Active' : 'Connecting...'}</span>
          </div>
        </div>
      </header>

      <main className='flex-1 p-4 lg:p-8'>
        {error ? (
          <div className='max-w-md mx-auto mt-8 p-6 glass-card border-red-500/20 bg-red-500/5'>
            <h2 className='text-xl font-bold text-red-400 mb-4 text-center'>⚠️ Connection Error</h2>
            <p className='text-gray-300 mb-6 text-center'>{error}</p>
            <button onClick={() => window.location.reload()} className='w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200'>
              🔄 Retry Connection
            </button>
          </div>
        ) : (
          <>{useEnhancedDashboard ? <EnhancedDashboard /> : <Dashboard />}</>
        )}
      </main>
    </div>
  )
}

export default App
