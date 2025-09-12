import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: String(error?.message || error) }
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-6 border rounded bg-red-50 text-red-800">
          <h2 className="font-semibold mb-2">Something went wrong.</h2>
          {this.state.message && <div className="text-sm mb-3">{this.state.message}</div>}
          <div className="flex gap-2 text-sm">
            <button className="px-3 py-1.5 rounded border" onClick={() => location.reload()}>Reload</button>
            <button className="px-3 py-1.5 rounded border" onClick={() => { try { localStorage.removeItem('kanban-app'); location.reload(); } catch { location.reload(); } }}>Reset app state</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

