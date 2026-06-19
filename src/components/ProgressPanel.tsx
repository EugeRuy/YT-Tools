import { useStore } from '../stores/useStore'

export default function ProgressPanel() {
  const isRunning = useStore((s) => s.isRunning)
  const taskType = useStore((s) => s.taskType)
  const current = useStore((s) => s.current)
  const total = useStore((s) => s.total)
  const currentUrl = useStore((s) => s.currentUrl)
  const progressPercent = useStore((s) => s.progressPercent)
  const taskComplete = useStore((s) => s.taskComplete)
  const taskError = useStore((s) => s.taskError)
  const cancelTask = useStore((s) => s.cancelTask)

  if (!isRunning && !taskComplete && !taskError) return null

  const label = taskType?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || ''

  return (
    <div className="card animate-scale-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-red-500 animate-pulse' : taskComplete ? 'bg-success' : 'bg-error'}`} />
          <div>
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              {label}
            </h4>
            {currentUrl && (
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-lg">
                {currentUrl}
              </p>
            )}
          </div>
        </div>
        {isRunning && (
          <button onClick={cancelTask} className="btn-danger text-sm py-2 px-4">
            Cancel
          </button>
        )}
      </div>

      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>
              {current} / {total}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${taskError ? 'error' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {isRunning && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Processing...
        </div>
      )}

      {taskComplete && (
        <div className="flex items-center gap-2 text-sm text-success">
          <span>✓</span> Task completed successfully
        </div>
      )}

      {taskError && (
        <div className="flex items-center gap-2 text-sm text-error">
          <span>✕</span> {taskError}
        </div>
      )}
    </div>
  )
}
