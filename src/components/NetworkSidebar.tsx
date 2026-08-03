import { ArrowLeftRight, Cable, CircleDollarSign, CreditCard, Network } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NETWORK_COLORS, NETWORKS } from '../data'
import type { Locale, NetworkId } from '../types'

const ICONS = { swift: Cable, visa: CreditCard, 'chips-fedwire': ArrowLeftRight, derivatives: Network, usdc: CircleDollarSign }

export function NetworkSidebar({ selected, onSelect, locale }: { selected: NetworkId; onSelect: (id: NetworkId) => void; locale: Locale }) {
  const { t } = useTranslation()
  return (
    <aside className="network-sidebar">
      <h2>{t('sidebar.title')}<span>5</span></h2>
      <div className="network-list">
        {NETWORKS.map((network) => {
          const Icon = ICONS[network.id]
          const color = `rgb(${NETWORK_COLORS[network.id].join(' ')})`
          return (
            <button key={network.id} className={selected === network.id ? 'selected' : ''} style={{ '--network': color } as React.CSSProperties} onClick={() => onSelect(network.id)} aria-pressed={selected === network.id}>
              <Icon size={18} /><span><b>{locale === 'ko' ? network.label : network.labelEn}</b><small>{locale === 'ko' ? network.description : network.descriptionEn}</small></span><i />
            </button>
          )
        })}
      </div>
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
