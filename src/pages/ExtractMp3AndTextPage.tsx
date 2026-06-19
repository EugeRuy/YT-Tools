import TaskPage from '../components/TaskPage'

export default function ExtractMp3AndTextPage() {
  return (
    <TaskPage
      taskType="transcribe_mp3_text"
      title="Extract MP3 + Text"
      description="Download audio and generate transcriptions simultaneously"
      buttonLabel="Start Processing"
    />
  )
}
