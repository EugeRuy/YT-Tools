import FolderPicker from './FolderPicker'
import FileDropZone from './FileDropZone'
import { useTaskForm } from '../hooks/useTaskForm'
import type { TaskType } from '../types'

interface TaskPageConfig {
  taskType: TaskType
  title: string
  description: string
  buttonLabel: string
  showUrlInput?: boolean
  urlLabel?: string
  urlPlaceholder?: string
}

export default function TaskPage({
  taskType,
  title,
  description,
  buttonLabel,
  showUrlInput,
  urlLabel = 'Channel or Playlist URL',
  urlPlaceholder,
}: TaskPageConfig) {
  const {
    url, setUrl,
    inputFile, setInputFile,
    outputDir, setOutputDir,
    isRunning,
    handleStart,
    canStart,
  } = useTaskForm(taskType)

  return (
    <div className="animate-fade-in">
      <div className="space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-gradient">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>

      <div className="card space-y-5">
        {showUrlInput ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-500">
              {urlLabel}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={urlPlaceholder || 'https://youtube.com/@channel'}
              className="input-field"
              disabled={isRunning}
            />
          </div>
        ) : (
          <FileDropZone value={inputFile} onChange={setInputFile} />
        )}

        <FolderPicker value={outputDir} onChange={setOutputDir} />

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn-primary w-full"
        >
          {isRunning ? 'Running...' : buttonLabel}
        </button>
      </div>
    </div>
  )
}
