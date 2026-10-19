import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'sonner'

function App() {
  return (
    <Suspense
      fallback={
        <div role="status" className="px-4 py-8 text-center text-sm text-[#6B6B6B]">
          Memuat halaman...
        </div>
      }
    >
      <Routes>
        {AppRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    <Toaster position="top-right" richColors duration={3000} closeButton />
  )
}

export default App
