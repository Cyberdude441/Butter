import { Navigate, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import About from './pages/About'
import Support from './pages/Support'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Login from './pages/Login'
import Register from './pages/Register'
import ForecastQuery from './pages/ForecastQuery'
import ForecastResults from './pages/ForecastResults'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to='/login' replace />
}

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landing />}></Route>
      <Route path='/about' element={<About />}></Route>
      <Route path='/support' element={<Support />}></Route>
      <Route path='/privacy' element={<Privacy />}></Route>
      <Route path='/terms' element={<Terms />}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/register' element={<Register />}></Route>
      <Route path='/forecast_query' element={<ProtectedRoute><ForecastQuery /></ProtectedRoute>}></Route>
      <Route path='/forecast_results' element={<ProtectedRoute><ForecastResults /></ProtectedRoute>}></Route>
    </Routes>
  )
}

export default App
