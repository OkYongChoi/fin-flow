import { Component, type ReactNode } from 'react'
import type { Locale } from '../types'

export class LoadBoundary extends Component<{ locale: Locale; children: ReactNode; resetKey?: string }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidUpdate(previous: Readonly<{ resetKey?: string }>) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    const ko = this.props.locale === 'ko'
    return <section className="data-state" role="alert">
      <h2>{ko ? '화면을 불러오지 못했습니다' : 'This view could not be loaded'}</h2>
      <p>{ko ? '연결 상태를 확인한 뒤 다시 불러오세요. 현재 주소와 브라우저에 저장된 초안은 유지됩니다.' : 'Check your connection, then reload. Your current address and drafts already saved in this browser are kept.'}</p>
      <button type="button" className="brief-button" onClick={() => window.location.reload()}>{ko ? '다시 불러오기' : 'Reload view'}</button>
      <a href={`/${this.props.locale}/map`}>{ko ? '네트워크 탐색으로 이동' : 'Go to network explorer'}</a>
    </section>
  }
}
