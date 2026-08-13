import { ArrowLeftRight, Cable, CircleDollarSign, CreditCard, Landmark, Network, Repeat2, Scale } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { NETWORK_COLORS, NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'

const ICONS = { swift: Cable, visa: CreditCard, 'chips-fedwire': ArrowLeftRight, 'bond-issuance': Landmark, derivatives: Network, 'fx-pvp': Repeat2, 'repo-financing': Scale, usdc: CircleDollarSign }

export function NetworkSidebar({ selected, onSelect, locale }: { selected: NetworkId; onSelect: (id: NetworkId) => void; locale: Locale }) {
  const { t } = useTranslation()
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const moveSelection = (event: React.KeyboardEvent<HTMLButtonElement>, current: number) => {
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? NETWORKS.length - 1 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (current + 1) % NETWORKS.length : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (current - 1 + NETWORKS.length) % NETWORKS.length : -1
    if (target < 0) return
    event.preventDefault()
    onSelect(NETWORKS[target].id)
    itemRefs.current[target]?.focus()
  }
  return (
    <aside className="network-sidebar" aria-labelledby="network-sidebar-title">
      <h2 id="network-sidebar-title">{t('sidebar.title')}<span>{NETWORKS.length}</span></h2>
      <nav className="network-list" aria-label={t('sidebar.title')}>
        {NETWORKS.map((network, index) => {
          const Icon = ICONS[network.id]
          const color = `rgb(${NETWORK_COLORS[network.id].join(' ')})`
          return (
            <button key={network.id} ref={(element) => { itemRefs.current[index] = element }} className={selected === network.id ? 'selected' : ''} style={{ '--network': color } as React.CSSProperties} onClick={() => onSelect(network.id)} onKeyDown={(event) => moveSelection(event, index)} aria-pressed={selected === network.id}>
              <Icon size={18} /><span><b>{locale === 'ko' ? network.label : network.labelEn}</b><small>{locale === 'ko' ? network.description : network.descriptionEn}</small></span><i />
            </button>
          )
        })}
      </nav>
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
