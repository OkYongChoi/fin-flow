import { describe, expect, it } from 'vitest'
import { NETWORKS } from './data'
import { searchNetworks } from './networkSearch'

const ids = (query: string) => searchNetworks(query).map(network => network.id)

describe('everyday network discovery', () => {
  it('finds related transfer guides while keeping token and card flows distinct', () => {
    expect(ids('송금')).toEqual(['swift', 'chips-fedwire'])
    expect(ids('bank transfer')).toEqual(['swift', 'chips-fedwire'])
    expect(ids('계좌이체')).toEqual(['swift', 'chips-fedwire'])
    expect(ids('해외 송금')).toEqual(['swift'])
    expect(ids('international transfer')).toEqual(['swift'])
    expect(ids('카드 결제')).toEqual(['visa'])
    expect(ids('card payment')).toEqual(['visa'])
    expect(ids('디지털 달러')).toEqual(['usdc'])
    expect(ids('digital dollar')).toEqual(['usdc'])
    expect(ids('스테이블코인')).toEqual(['usdc'])
  })

  it('accepts ordinary spacing, case, hyphens and full-width typing', () => {
    expect(ids('  해외송금  ')).toEqual(['swift'])
    expect(ids('CARD   PAYMENT')).toEqual(['visa'])
    expect(ids('digital-dollar')).toEqual(['usdc'])
    expect(ids('ＥＴＦ')).toContain('etf-primary-market')
  })

  it('keeps formal names and descriptions searchable alongside everyday terms', () => {
    expect(ids('CHIPS')).toEqual(['chips-fedwire'])
    expect(ids('Tri-party')).toEqual(['triparty-collateral'])
    expect(ids('interbank messaging')).toEqual(['swift'])
    expect(ids('만기 상환')).toEqual(['bond-servicing'])
    expect(ids('공모주')).toEqual(['securities-issuance'])
    expect(ids('주식 빌리기')).toEqual(['securities-lending'])
  })

  it('preserves catalog ordering, empty results and clearing the search', () => {
    expect(searchNetworks('')).toEqual(NETWORKS)
    expect(searchNetworks('   ')).toEqual(NETWORKS)
    expect(searchNetworks('no-such-network')).toEqual([])
    expect(searchNetworks('ETF')).toEqual(NETWORKS.filter(network => network.id === 'etf-primary-market'))
  })
})
