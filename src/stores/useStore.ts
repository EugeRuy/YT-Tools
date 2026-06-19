import { create } from 'zustand'
import type { AppSettings, LogEntry, PythonMessage, TaskType, TaskParams } from '../types'

interface AppState {
  settings: AppSettings
  isRunning: boolean
  taskType: TaskType | null
  current: number
  total: number
  currentUrl: string
  progressPercent: number
  logs: LogEntry[]
  outputPath: string | null
  taskComplete: boolean
  taskError: string | null

  setSettings: (settings: AppSettings) => void
  updateSettings: (partial: Partial<AppSettings>) => void
  handleMessage: (msg: PythonMessage) => void
  startTask: (type: TaskType, params: TaskParams) => Promise<void>
  cancelTask: () => Promise<void>
  clearLogs: () => void
  resetTask: () => void
  addLog: (level: LogEntry['level'], message: string) => void
}

const defaultSettings: AppSettings = {
  defaultOutputFolder: '',
  whisperModel: 'small',
  device: 'cpu',
  computeType: 'int8',
  beamSize: 5,
  maxParallelJobs: 1,
}

let logId = 0
const MAX_LOG_ENTRIES = 500

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export const useStore = create<AppState>((set, get) => ({
  settings: defaultSettings,
  isRunning: false,
  taskType: null,
  current: 0,
  total: 0,
  currentUrl: '',
  progressPercent: 0,
  logs: [],
  outputPath: null,
  taskComplete: false,
  taskError: null,

  setSettings: (settings) => set({ settings }),

  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  addLog: (level, message) =>
    set((s) => {
      const next = [
        ...s.logs,
        { id: ++logId, timestamp: formatTime(), level, message },
      ]
      if (next.length > MAX_LOG_ENTRIES) {
        next.splice(0, next.length - MAX_LOG_ENTRIES)
      }
      return { logs: next }
    }),

  handleMessage: (msg) => {
    const state = get()
    switch (msg.type) {
      case 'start':
        set({
          isRunning: true,
          taskComplete: false,
          taskError: null,
          outputPath: null,
          current: 0,
          total: 0,
          progressPercent: 0,
          logs: [],
        })
        state.addLog('info', msg.message || 'Task started')
        break
      case 'progress':
        set({
          current: msg.current ?? state.current,
          total: msg.total ?? state.total,
          progressPercent:
            msg.total && msg.total > 0
              ? Math.round(((msg.current ?? 0) / msg.total) * 100)
              : state.progressPercent,
          currentUrl: msg.message || state.currentUrl,
        })
        break
      case 'log':
        if (msg.level && msg.message) {
          state.addLog(msg.level, msg.message)
        }
        break
      case 'error':
        state.addLog('error', msg.message || 'Unknown error')
        set({ taskError: msg.message || 'Unknown error' })
        break
      case 'complete':
        set({
          isRunning: false,
          taskComplete: true,
          outputPath: msg.output_path || state.outputPath,
          progressPercent: msg.success ? 100 : state.progressPercent,
        })
        if (msg.message) {
          state.addLog(msg.success ? 'success' : 'error', msg.message)
        }
        break
    }
  },

  startTask: async (type, params) => {
    const state = get()
    set({
      isRunning: true,
      taskType: type,
      taskComplete: false,
      taskError: null,
      outputPath: null,
      current: 0,
      total: 0,
      progressPercent: 0,
      logs: [],
    })
    state.addLog('info', `Starting ${type.replace(/_/g, ' ')}...`)
    try {
      await window.electronAPI.startTask(type, params)
    } catch (err: any) {
      state.addLog('error', err.message || 'Task failed')
      set({ isRunning: false, taskError: err.message || 'Task failed' })
    }
  },

  cancelTask: async () => {
    try {
      await window.electronAPI.cancelTask()
      set({ isRunning: false })
      get().addLog('warn', 'Task cancelled by user')
    } catch (err: any) {
      get().addLog('error', `Cancel failed: ${err.message}`)
    }
  },

  clearLogs: () => set({ logs: [] }),

  resetTask: () =>
    set({
      isRunning: false,
      taskType: null,
      current: 0,
      total: 0,
      currentUrl: '',
      progressPercent: 0,
      outputPath: null,
      taskComplete: false,
      taskError: null,
    }),
}))
