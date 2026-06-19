import { memo } from 'react'

interface FolderPickerProps {
  value: string
  onChange: (path: string) => void
  label?: string
}

const FolderPicker = memo(function FolderPicker({
  value,
  onChange,
  label = 'Output Folder',
}: FolderPickerProps) {
  const handleBrowse = async () => {
    const path = await window.electronAPI.openFolder()
    if (path) onChange(path)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          readOnly
          placeholder="Select output folder..."
          className="input-field flex-1 cursor-pointer"
          onClick={handleBrowse}
        />
        <button onClick={handleBrowse} className="btn-primary text-sm whitespace-nowrap px-4">
          Browse
        </button>
      </div>
    </div>
  )
})

export default FolderPicker
