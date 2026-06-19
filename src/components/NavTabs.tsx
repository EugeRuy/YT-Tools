import { memo } from 'react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: '◈' },
  { to: '/extract-links', label: 'Extract Links', icon: '⊞' },
  { to: '/extract-text', label: 'Extract Text', icon: '⊡' },
  { to: '/extract-mp3', label: 'Extract MP3', icon: '♪' },
  { to: '/extract-mp3-text', label: 'Extract MP3 + Text', icon: '♫' },
  { to: '/extract-video', label: 'Extract Video', icon: '▶' },
]

const NavTabs = memo(function NavTabs() {
  return (
    <header className="glass shrink-0">
      <div className="flex items-center px-6">
        <div className="flex items-center gap-2.5 pr-6 mr-6 border-r border-surface-border/50 py-3.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-red-900/40">
            YT
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-100">
            Tools
          </span>
        </div>

        <nav className="flex items-center gap-0.5 flex-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'border-red-500 text-red-400 bg-gradient-to-b from-red-500/5 to-transparent nav-glow'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`
              }
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-red-500/10 text-red-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`
          }
        >
          <span className="text-lg">⚙</span>
          Settings
        </NavLink>
      </div>
    </header>
  )
})

export default NavTabs
