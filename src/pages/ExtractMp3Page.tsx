import TaskPage from '../components/TaskPage'

export default function ExtractMp3Page() {
  return (
    <TaskPage
      taskType="download_mp3"
      title="Extract MP3"
      description="Download audio from YouTube videos as MP3 files"
      buttonLabel="Start Download"
    />
  )
}
