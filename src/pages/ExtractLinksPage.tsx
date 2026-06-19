import TaskPage from '../components/TaskPage'

export default function ExtractLinksPage() {
  return (
    <TaskPage
      taskType="extract_links"
      title="Extract Links"
      description="Extract all video URLs from a YouTube channel or playlist"
      buttonLabel="Start Extraction"
      showUrlInput
      urlLabel="Channel"
      urlPlaceholder="https://youtube.com/@channel or https://youtube.com/playlist?list=..."
    />
  )
}
