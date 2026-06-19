export interface AppSettings {
  defaultOutputFolder: string
  whisperModel: 'tiny' | 'base' | 'small' | 'medium' | 'large-v3'
  device: 'cpu' | 'cuda'
  computeType: 'int8' | 'float16' | 'int8_float16'
  beamSize: number
  maxParallelJobs: number
}

export interface LogEntry {
  id: number
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}

export interface PythonMessage {
  type: 'start' | 'progress' | 'log' | 'error' | 'complete'
  level?: 'info' | 'warn' | 'error' | 'success'
  current?: number
  total?: number
  message?: string
  success?: boolean
  output_path?: string
  taskType?: string
  params?: Record<string, string>
}

export type TaskType = 'extract_links' | 'extract_text' | 'download_mp3' | 'transcribe_mp3_text' | 'download_video'

export interface TaskParams {
  url?: string
  inputFile?: string
  outputDir: string
}

export interface ElectronAPI {
  startTask: (type: TaskType, params: TaskParams) => Promise<{ success: boolean }>
  cancelTask: () => Promise<{ success: boolean; message?: string }>
  getTaskStatus: () => Promise<{ running: boolean }>
  openFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>
  openFolder: () => Promise<string | null>
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  onMessage: (callback: (data: PythonMessage) => void) => () => void
  saveTempFile: (content: string, name: string) => Promise<string>
  checkFfmpeg: () => Promise<{ installed: boolean }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
