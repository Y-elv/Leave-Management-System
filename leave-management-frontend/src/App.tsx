import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
