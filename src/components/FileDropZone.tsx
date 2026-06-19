import { useState, useCallback } from 'react'

interface FileDropZoneProps {
  value: string
  onChange: (path: string) => void
  accept?: string
  label?: string
  placeholder?: string
}

export default function FileDropZone({
  value,
  onChange,
  accept = '.txt',
  label = 'URL List File',
  placeholder = 'Drop a .txt file here or click to browse',
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleBrowse = useCallback(async () => {
    const path = await window.electronAPI.openFile([
      { name: 'Text Files', extensions: ['txt'] },
    ])
    if (path) onChange(path)
  }, [onChange])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith('.txt')
      )
      if (files.length > 0) {
        const file = files[0]
        const content = await file.text()
        const tempPath = await window.electronAPI.saveTempFile(content, file.name)
        onChange(tempPath)
      }
    },
    [onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <div
        onClick={handleBrowse}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragging
            ? 'border-red-500/60 bg-red-500/5'
            : value
            ? 'border-red-500/30 bg-red-500/[0.03]'
            : 'border-surface-border hover:border-red-500/30 bg-surface'
        }`}
      >
        {value ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-red-400">⊡</span>
            <span className="text-gray-300 truncate max-w-sm">{value}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="text-gray-600 hover:text-red-400 ml-2 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={`transition-all duration-200 ${dragging ? 'scale-105' : ''}`}>
            <div className={`text-2xl mb-2 transition-colors ${dragging ? 'text-red-400' : 'text-gray-600'}`}>
              ⊡
            </div>
            <p className={`text-sm ${dragging ? 'text-red-300' : 'text-gray-500'}`}>
              {dragging ? 'Drop your file here' : placeholder}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              or drag and drop a .txt file here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
