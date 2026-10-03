import { Navigate, Route, Routes } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Routes>
      {AppRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
