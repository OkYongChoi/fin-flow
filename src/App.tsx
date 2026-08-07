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
  if (page === 'institutions') return <InfoPage type="institutions" locale={locale} />
  if (page === 'assets') return <InfoPage type="assets" locale={locale} slug={slug} />
  if (page === 'learn') return <InfoPage type="learn" locale={locale} slug={slug} />
  if (page === 'data') return <Suspense fallback={<PageLoader />}><DataPage locale={locale} /></Suspense>
  return <PageLoader />
}

export function AppHeader({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const { t } = useTranslation()
  const { navigate, pathname, search } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const switchLocale = () => navigate(pathname.replace(/^\/(ko|en)/, locale === 'ko' ? '/en' : '/ko') + search)
  const go = (path: string) => { setMenuOpen(false); navigate(`/${locale}/${path}`) }
  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', closeMenu)
    return () => window.removeEventListener('keydown', closeMenu)
  }, [])
  return (
    <header className={`app-header ${compact ? 'compact' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <button className="mobile-menu icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={21} /></button>
      <button className="brand" onClick={() => go('map')}><Orbit aria-hidden="true" /><span>Flow of Money</span></button>
      <nav aria-label="Primary">
        {[['map', t('nav.map')], ['networks', t('nav.networks')], ['institutions', t('nav.institutions')], ['assets', t('nav.assets')], ['data', t('nav.data')]].map(([path, label]) => (
          <button key={path} className={pathname.includes(`/${path}`) ? 'active' : ''} onClick={() => go(path)}>{label}</button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="locale-button" onClick={switchLocale}>{locale === 'ko' ? 'EN' : 'KO'}</button>
        <button className="icon-button" aria-label="About the project" onClick={() => go('learn')}><Landmark size={18} /></button>
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
