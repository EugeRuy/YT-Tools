import TaskPage from '../components/TaskPage'

export default function ExtractTextPage() {
  return (
    <TaskPage
      taskType="extract_text"
      title="Extract Text"
      description="Transcribe YouTube videos to text without keeping the audio"
      buttonLabel="Start Transcription"
    />
  )
}
