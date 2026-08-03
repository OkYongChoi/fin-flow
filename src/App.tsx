import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Landmark, Menu, Orbit } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { InfoPage } from './components/InfoPage'
import { useRouter } from './router'
import type { Locale } from './types'

const DataPage = lazy(() => import('./components/DataPage'))
const VALID_PAGES = new Set(['map', 'networks', 'institutions', 'assets', 'learn', 'data'])

function LocaleRoutes() {
  const { pathname, navigate } = useRouter()
  const parts = pathname.split('/').filter(Boolean)
  const locale: Locale = parts[0] === 'en' ? 'en' : 'ko'
  const page = parts[1] ?? 'map'
  const slug = parts[2]
  const { i18n } = useTranslation()
  useEffect(() => { void i18n.changeLanguage(locale); document.documentElement.lang = locale }, [i18n, locale])
  useEffect(() => { if (!VALID_PAGES.has(page)) navigate(`/${locale}/map`, true) }, [locale, navigate, page])
  if (page === 'map') return <Dashboard locale={locale} />
  if (page === 'networks') return <InfoPage type="networks" locale={locale} slug={slug} />
  if (page === 'institutions') return <InfoPage type="institutions" locale={locale} slug={slug} />
  if (page === 'assets') return <InfoPage type="assets" locale={locale} slug={slug} />
  if (page === 'learn') return <InfoPage type="learn" locale={locale} slug={slug} />
  if (page === 'data') return <Suspense fallback={<PageLoader />}><DataPage locale={locale} /></Suspense>
  return <PageLoader />
}

export function AppHeader({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const { t } = useTranslation()
  const { navigate, pathname, search } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigateFromHeader = (to: string) => {
    setMenuOpen(false)
    navigate(to)
  }
  const switchLocale = () => navigateFromHeader(pathname.replace(/^\/(ko|en)/, locale === 'ko' ? '/en' : '/ko') + search)

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <header className={`app-header ${compact ? 'compact' : ''}`}>
      <button
        className="mobile-menu icon-button"
        aria-label={locale === 'ko' ? (menuOpen ? '메뉴 닫기' : '메뉴 열기') : (menuOpen ? 'Close menu' : 'Open menu')}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      ><Menu size={21} /></button>
      <button className="brand" onClick={() => navigateFromHeader(`/${locale}/map`)}><Orbit aria-hidden="true" /><span>Flow of Money</span></button>
      <nav
        id="primary-navigation"
        className={menuOpen ? 'mobile-nav-open' : undefined}
        aria-label={locale === 'ko' ? '주요 메뉴' : 'Primary'}
      >
        {[['map', t('nav.map')], ['networks', t('nav.networks')], ['institutions', t('nav.institutions')], ['assets', t('nav.assets')], ['learn', t('pages.learn')], ['data', t('nav.data')]].map(([path, label]) => (
          <button key={path} className={pathname.includes(`/${path}`) ? 'active' : ''} onClick={() => navigateFromHeader(`/${locale}/${path}`)}>{label}</button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="locale-button" onClick={switchLocale}>{locale === 'ko' ? 'EN' : 'KO'}</button>
        <button className="icon-button" aria-label={locale === 'ko' ? '프로젝트 소개' : 'About the project'} onClick={() => navigateFromHeader(`/${locale}/learn`)}><Landmark size={18} /></button>
      </div>
    </header>
  )
}

function PageLoader() { return <div className="page-loader"><Orbit /><span>Loading source-backed data…</span></div> }

export default function App() {
  const { pathname, navigate } = useRouter()
  const validLocale = /^\/(ko|en)(\/|$)/.test(pathname)
  useEffect(() => { if (!validLocale) navigate('/ko/map', true) }, [navigate, validLocale])
  return validLocale ? <LocaleRoutes /> : <PageLoader />
}
