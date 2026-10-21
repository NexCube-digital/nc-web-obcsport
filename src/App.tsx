import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
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
    </>
  )
}

export default App
