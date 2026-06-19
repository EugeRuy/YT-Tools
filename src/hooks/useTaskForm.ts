import { useState } from 'react'
import { useStore } from '../stores/useStore'
import type { TaskType } from '../types'

export function useTaskForm(taskType: TaskType) {
  const { startTask, isRunning, settings } = useStore()
  const [url, setUrl] = useState('')
  const [inputFile, setInputFile] = useState('')
  const [outputDir, setOutputDir] = useState(settings.defaultOutputFolder)

  const handleStart = async () => {
    const needsFile = taskType !== 'extract_links'
    if (needsFile && !inputFile) return
    if (!needsFile && !url.trim()) return
    if (!outputDir) return
    try {
      const params = needsFile
        ? { inputFile, outputDir }
        : { url: url.trim(), outputDir }
      await startTask(taskType, params)
    } catch (err) {
      console.error(err)
    }
  }

  const canStart = outputDir && !isRunning && (
    taskType === 'extract_links' ? url.trim() : inputFile
  )

  return {
    url,
    setUrl,
    inputFile,
    setInputFile,
    outputDir,
    setOutputDir,
    isRunning,
    handleStart,
    canStart,
  }
}
