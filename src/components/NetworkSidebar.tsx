import { ArrowLeftRight, BookOpenCheck, Boxes, Cable, ChartCandlestick, CircleDollarSign, CreditCard, FileStack, Gavel, Handshake, Landmark, Layers3, Network, ReceiptText, Repeat2, Scale, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { NETWORK_COLORS, NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'

const ICONS = { swift: Cable, visa: CreditCard, 'chips-fedwire': ArrowLeftRight, 'bond-issuance': Landmark, 'securities-issuance': FileStack, 'bond-servicing': ReceiptText, 'multi-bond-issuance': Landmark, 'asset-backed-securitization': Boxes, derivatives: Network, 'leveraged-derivatives-issuance': Network, 'credit-derivatives': Gavel, 'listed-derivatives': ChartCandlestick, 'fx-pvp': Repeat2, 'repo-financing': Scale, 'triparty-collateral': ShieldCheck, 'etf-primary-market': Layers3, 'securities-lending': Handshake, 'syndicated-loans': BookOpenCheck, usdc: CircleDollarSign }

export function NetworkSidebar({ selected, onSelect, locale, query, onQueryChange }: { query: string; onQueryChange: (query: string) => void; selected: NetworkId; onSelect: (id: NetworkId) => void; locale: Locale }) {
  const { t } = useTranslation()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const filteredNetworks = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    if (!needle) return NETWORKS
    return NETWORKS.filter((network) => [network.label, network.labelEn, network.description, network.descriptionEn]
      .some((value) => value.toLocaleLowerCase(locale).includes(needle)))
  }, [locale, query])

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return
      if (!searchRef.current || searchRef.current.offsetParent === null) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const selectedNetwork = NETWORKS.find((network) => network.id === selected)!
  const selectionOutsideResults = !filteredNetworks.some((network) => network.id === selected)

  const moveSelection = (event: React.KeyboardEvent<HTMLButtonElement>, current: number) => {
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? filteredNetworks.length - 1 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (current + 1) % filteredNetworks.length : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (current - 1 + filteredNetworks.length) % filteredNetworks.length : -1
    if (target < 0) return
    event.preventDefault()
    onSelect(filteredNetworks[target].id)
    itemRefs.current[target]?.focus()
  }
  return (
    <aside className="network-sidebar" aria-labelledby="network-sidebar-title">
      <h2 id="network-sidebar-title">{t('sidebar.title')}<span>{query ? `${filteredNetworks.length}/${NETWORKS.length}` : NETWORKS.length}</span></h2>
      <div className="network-search">
        <Search size={13} aria-hidden="true" />
        <input ref={searchRef} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onQueryChange('') }} aria-label={locale === 'ko' ? '금융 네트워크 검색' : 'Search financial networks'} placeholder={locale === 'ko' ? '네트워크·기능 검색' : 'Search network or function'} />
        {query ? <button type="button" onClick={() => { onQueryChange(''); searchRef.current?.focus() }} aria-label={locale === 'ko' ? '네트워크 검색어 지우기' : 'Clear network search'}><X size={12} /></button> : <kbd aria-hidden="true">/</kbd>}
      </div>
      <p className="network-result-status" role="status">{query.trim() ? (locale === 'ko' ? `검색 결과 ${filteredNetworks.length}개` : `${filteredNetworks.length} matching networks`) : ''}</p>
      {selectionOutsideResults ? <div className="selection-filter-notice">
        <p>{locale === 'ko' ? `현재 선택한 ${selectedNetwork.label}은(는) 검색 결과에 없습니다.` : `Selected network ${selectedNetwork.labelEn} is outside the search results.`}</p>
        <button type="button" onClick={() => { onQueryChange(''); searchRef.current?.focus() }}>{locale === 'ko' ? '검색어 지우기' : 'Clear search'}</button>
      </div> : null}
      <nav className="network-list" aria-label={t('sidebar.title')}>
        {filteredNetworks.map((network, index) => {
          const Icon = ICONS[network.id]
          const color = `rgb(${NETWORK_COLORS[network.id].join(' ')})`
          return (
            <button key={network.id} ref={(element) => { itemRefs.current[index] = element }} className={selected === network.id ? 'selected' : ''} style={{ '--network': color } as React.CSSProperties} onClick={() => onSelect(network.id)} onKeyDown={(event) => moveSelection(event, index)} aria-pressed={selected === network.id}>
              <Icon size={18} /><span><b>{locale === 'ko' ? network.label : network.labelEn}</b><small>{locale === 'ko' ? '공식 출처 연결' : 'Primary source linked'}</small></span><i />
            </button>
          )
        })}
      </nav>
      {filteredNetworks.length === 0 ? <p className="network-empty">{locale === 'ko' ? '일치하는 네트워크가 없습니다.' : 'No matching networks.'}</p> : null}
      <div className="legend-panel">
        <h3>{t('sidebar.legend')}</h3>
        {[['message', 'message'], ['payment', 'settlement'], ['clearing', 'clearing'], ['onchain', 'onchain']].map(([label, type]) => (
          <div key={type}><span className={`legend-line ${type}`} /><span>{t(`sidebar.${label}`)}</span></div>
        ))}
      </div>
      <div className="node-legend"><span>{t('sidebar.nodeSize')}</span><div><i /><i /><i /></div></div>
    </aside>
  )
}
