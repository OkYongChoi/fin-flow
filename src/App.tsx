import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Landmark, Menu, Orbit } from 'lucide-react'
import { useRouter } from './router'
import { LoadBoundary } from './components/LoadBoundary'
import type { Locale } from './types'

const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })))
const InfoPage = lazy(() => import('./components/InfoPage').then(module => ({ default: module.InfoPage })))
const WorkspacePage = lazy(() => import('./components/WorkspacePage'))
const DataPage = lazy(() => import('./components/DataPage'))
const VALID_PAGES = new Set(['map', 'networks', 'institutions', 'assets', 'learn', 'data', 'workspace', 'pricing'])
const PAGE_TITLES: Record<string, [string, string]> = { workspace: ['브리핑 작업실', 'Briefing workspace'], pricing: ['요금제', 'Plans'], map: ['금융 네트워크 데이터', 'Financial network data'], networks: ['네트워크', 'Networks'], institutions: ['기관', 'Institutions'], assets: ['자산', 'Assets'], learn: ['학습', 'Learn'], data: ['데이터', 'Data'] }

function LocaleRoutes() {
  const { pathname, navigate } = useRouter()
  const parts = pathname.split('/').filter(Boolean)
  const locale: Locale = parts[0] === 'en' ? 'en' : 'ko'
  const page = parts[1] ?? 'map'
  const slug = parts[2]
  const { i18n } = useTranslation()
  useEffect(() => { void i18n.changeLanguage(locale); document.documentElement.lang = locale }, [i18n, locale])
  useEffect(() => {
    document.title = `${PAGE_TITLES[page]?.[locale === 'ko' ? 0 : 1] ?? 'Flow of Money'} · Flow of Money`
  }, [locale, page])
  useEffect(() => { if (!VALID_PAGES.has(page)) navigate(`/${locale}/map`, true) }, [locale, navigate, page])
  return <LoadBoundary resetKey={`${locale}/${page}`} locale={locale}><Suspense fallback={<PageLoader locale={locale} />}>
    {page === 'workspace' || page === 'pricing' ? <WorkspacePage locale={locale} pricing={page === 'pricing'} />
      : page === 'map' ? <Dashboard locale={locale} />
      : page === 'networks' || page === 'institutions' || page === 'assets' || page === 'learn' ? <InfoPage type={page} locale={locale} slug={slug} />
      : page === 'data' ? <DataPage locale={locale} />
      : <PageLoader locale={locale} />}
  </Suspense></LoadBoundary>
}

export function AppHeader({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const { t } = useTranslation()
  const { navigate, pathname, search } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const activePage = pathname.split('/').filter(Boolean)[1] ?? 'map'
  const switchLocale = () => navigate(pathname.replace(/^\/(ko|en)/, locale === 'ko' ? '/en' : '/ko') + search)
  const go = (path: string) => { setMenuOpen(false); navigate(`/${locale}/${path}`) }
  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButtonRef.current?.focus() } }
    window.addEventListener('keydown', closeMenu)
    return () => window.removeEventListener('keydown', closeMenu)
  }, [menuOpen])
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); const main = document.getElementById('main-content'); main?.scrollIntoView(); main?.focus() }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); const main = document.getElementById('main-content'); main?.scrollIntoView(); main?.focus() } }}>{locale === 'ko' ? '본문으로 건너뛰기' : 'Skip to main content'}</a>
    <header className={`app-header ${compact ? 'compact' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <button type="button" ref={menuButtonRef} className="mobile-menu icon-button" aria-label={menuOpen ? (locale === 'ko' ? '메뉴 닫기' : 'Close menu') : (locale === 'ko' ? '메뉴 열기' : 'Open menu')} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={21} /></button>
      <button type="button" className="brand" onClick={() => go('map')}><Orbit aria-hidden="true" /><span>Flow of Money</span></button>
      <nav id="primary-navigation" aria-label={locale === 'ko' ? '주요 탐색' : 'Primary'}>
        {[['map', t('nav.map')], ['networks', t('nav.networks')], ['institutions', t('nav.institutions')], ['assets', t('nav.assets')], ['data', t('nav.data')], ['workspace', locale === 'ko' ? '브리핑' : 'Briefings']].map(([path, label]) => (
          <button type="button" key={path} className={activePage === path ? 'active' : ''} aria-current={activePage === path ? 'page' : undefined} onClick={() => go(path)}>{label}</button>
        ))}
      </nav>
      <div className="header-actions">
        <button type="button" className="locale-button" aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'} onClick={switchLocale}>{locale === 'ko' ? 'EN' : 'KO'}</button>
        <button type="button" className="icon-button" aria-label={locale === 'ko' ? '프로젝트 소개' : 'About the project'} onClick={() => go('learn')}><Landmark size={18} /></button>
      </div>
    </header>
    </>
  )
}

function PageLoader({ locale = 'ko' }: { locale?: Locale }) { return <div className="page-loader" role="status"><Orbit aria-hidden="true" /><span>{locale === 'ko' ? '출처 데이터를 불러오는 중…' : 'Loading source-backed data…'}</span></div> }

export default function App() {
  const { pathname, navigate } = useRouter()
  const validLocale = /^\/(ko|en)(\/|$)/.test(pathname)
  useEffect(() => { if (!validLocale) navigate('/ko/map', true) }, [navigate, validLocale])
  return validLocale ? <LocaleRoutes /> : <PageLoader />
}
