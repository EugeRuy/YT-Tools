import TaskPage from '../components/TaskPage'

export default function ExtractVideoPage() {
  return (
    <TaskPage
      taskType="download_video"
      title="Extract Video"
      description="Download video from any URL (YouTube, Vimeo, Twitter, and more)"
      buttonLabel="Start Download"
      showUrlInput
      urlLabel="Video URL"
      urlPlaceholder="https://youtube.com/watch?v=... or any supported platform URL"
    />
  )
}
