import { useEffect, useRef } from 'react'
import { useStore } from '../stores/useStore'

const levelStyles: Record<string, string> = {
  info: 'text-gray-400',
  warn: 'text-warning',
  error: 'text-red-400',
  success: 'text-success',
}

const levelDots: Record<string, string> = {
  info: 'bg-gray-600',
  warn: 'bg-warning',
  error: 'bg-red-500',
  success: 'bg-success',
}

export default function LogViewer() {
  const logs = useStore((s) => s.logs)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Logs
        </h4>
        <span className="text-xs text-gray-600">
          {logs.length > 0 ? `${logs.length} entries` : 'waiting...'}
        </span>
      </div>
      <div className="bg-gradient-to-b from-surface to-surface-light rounded-xl p-3 h-44 overflow-y-auto font-mono text-xs leading-relaxed border border-surface-border/30">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-700 text-lg mb-1">⊡</div>
              <span className="text-gray-600">No logs yet — start a task to see output here</span>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2 py-0.5 hover:bg-white/[0.02] rounded px-1 -mx-1 transition-colors">
              <span className="text-gray-700 shrink-0 w-[68px]">[{log.timestamp}]</span>
              <span className={`shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full ${levelDots[log.level] || 'bg-gray-600'}`} />
              <span className={`${levelStyles[log.level] || 'text-gray-400'}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
