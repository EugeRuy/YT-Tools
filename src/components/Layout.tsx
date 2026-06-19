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
      <div className="bg-tech">
        <div className="bg-tech-glow" />
        <div className="bg-tech-sweep" />
        <div className="bg-travelers-h">
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
          <div className="bg-traveler-h" />
        </div>
        <div className="bg-travelers-v">
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
          <div className="bg-traveler-v" />
        </div>
      </div>
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />
      <div className="bg-particle" />

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
