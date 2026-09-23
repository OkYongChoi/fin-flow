import { ClerkProvider, SignInButton, UserButton, useAuth } from '@clerk/react'
import { Workspace } from '../WorkspacePage'
import type { Locale } from '../../types'

interface WorkspaceProps { locale: Locale; pricing?: boolean }

export default function ConnectedWorkspace({ publishableKey, ...props }: WorkspaceProps & { publishableKey: string }) {
  return <ClerkProvider publishableKey={publishableKey}><Connected {...props} /></ClerkProvider>
}

function Connected(props: WorkspaceProps) {
  const { userId, getToken, isLoaded } = useAuth()
  if (!isLoaded) return <div role="status" className="workspace-main">{props.locale === 'ko' ? '계정 확인 중…' : 'Checking your account…'}</div>
  return <Workspace key={userId ?? 'guest'} {...props} session={{ userId: userId ?? null, getToken, ready: true, controls: userId ? <UserButton /> : undefined, signIn: userId ? undefined : (label, before) => <SignInButton mode="modal"><button className="brief-button" onClick={before}>{label}</button></SignInButton> }} />
}
