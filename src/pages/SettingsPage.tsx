import { useStore } from '../stores/useStore'
import { useEffect, useState } from 'react'
import type { AppSettings } from '../types'

const WHISPER_MODELS = ['tiny', 'base', 'small', 'medium', 'large-v3'] as const
const DEVICES = ['cpu', 'cuda'] as const
const COMPUTE_TYPES = ['int8', 'float16', 'int8_float16'] as const

export default function SettingsPage() {
  const { settings, updateSettings, setSettings } = useStore()
  const [ffmpegInstalled, setFfmpegInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    window.electronAPI.checkFfmpeg().then((r) => setFfmpegInstalled(r.installed))
  }, [])

  const handleSave = async () => {
    try {
      const updated = await window.electronAPI.setSettings(settings)
      setSettings(updated)
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  const handleChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    updateSettings({ [key]: value })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gradient">Settings</h2>
        <p className="text-gray-500">Configure application preferences</p>
      </div>

      <div className="card space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            General
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Default Output Folder
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.defaultOutputFolder}
                  readOnly
                  placeholder="Not set"
                  className="input-field flex-1 cursor-pointer"
                  onClick={async () => {
                    const path = await window.electronAPI.openFolder()
                    if (path) handleChange('defaultOutputFolder', path)
                  }}
                />
                <button
                  onClick={async () => {
                    const path = await window.electronAPI.openFolder()
                    if (path) handleChange('defaultOutputFolder', path)
                  }}
                  className="btn-primary text-sm px-4"
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Maximum Parallel Jobs
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={settings.maxParallelJobs}
                onChange={(e) =>
                  handleChange('maxParallelJobs', parseInt(e.target.value) || 1)
                }
                className="input-field w-32"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border/60 pt-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Whisper Model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Model Name
              </label>
              <select
                value={settings.whisperModel}
                onChange={(e) => handleChange('whisperModel', e.target.value as any)}
                className="input-field"
              >
                {WHISPER_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Device
              </label>
              <select
                value={settings.device}
                onChange={(e) => handleChange('device', e.target.value as any)}
                className="input-field"
              >
                {DEVICES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Compute Type
              </label>
              <select
                value={settings.computeType}
                onChange={(e) => handleChange('computeType', e.target.value as any)}
                className="input-field"
              >
                {COMPUTE_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Beam Size
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.beamSize}
                onChange={(e) =>
                  handleChange('beamSize', parseInt(e.target.value) || 5)
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border/60 pt-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Video Quality
          </h3>
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${ffmpegInstalled ? 'bg-success/5 border-success/20' : 'bg-surface border-surface-border'}`}>
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${ffmpegInstalled === null ? 'bg-gray-600 animate-pulse' : ffmpegInstalled ? 'bg-success' : 'bg-warning'}`} />
            <div className="text-sm">
              {ffmpegInstalled === null ? (
                <span className="text-gray-500">Checking...</span>
              ) : ffmpegInstalled ? (
                <>
                  <span className="text-success font-medium">ffmpeg detected</span>
                  <span className="text-gray-400 ml-1">— videos download at up to 1080p</span>
                </>
              ) : (
                <>
                  <span className="text-warning font-medium">ffmpeg not found</span>
                  <span className="text-gray-400 ml-1">— videos download at 720p max</span>
                  <p className="text-gray-600 mt-1">
                    Install ffmpeg for 1080p downloads:{' '}
                    <a href="https://ffmpeg.org/download.html" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline">ffmpeg.org/download.html</a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border/60 pt-6 flex justify-end">
          <button onClick={handleSave} className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>

      <div className="card text-xs text-gray-600 space-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <p>Default whisper settings: small model, CPU, int8 quantization</p>
        <p>Models are downloaded on first use and cached locally</p>
        <p>Change to CUDA if you have an NVIDIA GPU for faster transcription</p>
      </div>
    </div>
  )
}
