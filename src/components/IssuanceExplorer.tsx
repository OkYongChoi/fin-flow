import { lazy, Suspense } from 'react'
import type { Locale } from '../types'
import { LoadBoundary } from './LoadBoundary'

const IssuanceFlowLibrary = lazy(() => import('./IssuanceFlowLibrary').then(module => ({ default: module.IssuanceFlowLibrary })))

export function IssuanceExplorer({ locale }: { locale: Locale }) {
  return <div id="issuance-library" tabIndex={-1}>
    <LoadBoundary locale={locale}><Suspense fallback={<p role="status">{locale === 'ko' ? '발행 경로를 불러오는 중…' : 'Loading issuance paths…'}</p>}>
      <IssuanceFlowLibrary locale={locale} />
    </Suspense></LoadBoundary>
  </div>
}
