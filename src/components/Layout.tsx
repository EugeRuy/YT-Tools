import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavTabs from './NavTabs'
import ProgressPanel from './ProgressPanel'
import LogViewer from './LogViewer'
import { useStore } from '../stores/useStore'

export default function Layout() {
  const handleMessage = useStore((s) => s.handleMessage)
  const setSettings = useStore((s) => s.setSettings)
  const location = useLocation()
  const showTaskUI = location.pathname !== '/' && location.pathname !== '/settings'

  useEffect(() => {
    const cleanup = window.electronAPI.onMessage((msg) => {
      handleMessage(msg)
    })
    return cleanup
  }, [handleMessage])

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings).catch(console.error)
  }, [setSettings])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-800/5 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDuration: '12s' }} />
      </div>

      <NavTabs />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 relative z-10">
        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            <Outlet />
            {showTaskUI && (
              <>
                <ProgressPanel />
                <LogViewer />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
