import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskPage from '../components/TaskPage'

export default function ExtractVideoPage() {
  const [ffmpeg, setFfmpeg] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    window.electronAPI?.checkFfmpeg?.().then((r) => setFfmpeg(r.installed))
  }, [])

  return (
    <div className="animate-fade-in space-y-4">
      {ffmpeg === true && (
        <div className="flex items-start gap-3 rounded-lg border border-green-700/40 bg-green-950/30 px-4 py-3">
          <span className="text-lg leading-none text-green-400">✔</span>
          <div className="text-sm text-green-300">
            <span className="font-medium text-green-200">ffmpeg detected</span>
            {' — '}videos will be downloaded at best quality up to 1080p with audio merged.
          </div>
        </div>
      )}
      {ffmpeg === false && (
        <div className="flex items-start gap-3 rounded-lg border border-red-700/40 bg-red-950/30 px-4 py-3">
          <span className="text-lg leading-none text-red-400">✖</span>
          <div className="text-sm text-red-300">
            <span className="font-medium text-red-200">ffmpeg not found</span>
            {' — '}downloads will be limited to the best single stream (typically 720p or lower, no audio merge).
            {' '}
            <button
              onClick={() => navigate('/settings')}
              className="underline underline-offset-2 hover:text-red-200"
            >
              Check settings for more info
            </button>
          </div>
        </div>
      )}
      <TaskPage
        taskType="download_video"
        title="Extract Video"
        description="Download video from any URL (YouTube, Vimeo, Twitter, and more)"
        buttonLabel="Start Download"
        showUrlInput
        urlLabel="Video URL"
        urlPlaceholder="https://youtube.com/watch?v=... or any supported platform URL"
      />
    </div>
  )
}
