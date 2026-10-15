import { lazy } from 'react'
import DeferredSection from './DeferredSection'

const Footer = lazy(() => import('./Footer'))

function DeferredFooter() {
  return (
    <DeferredSection placeholderClassName="min-h-[180px]">
      <Footer />
    </DeferredSection>
  )
}

export default DeferredFooter
