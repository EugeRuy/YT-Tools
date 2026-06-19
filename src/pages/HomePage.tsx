import FeatureCard from '../components/FeatureCard'

const features = [
  {
    title: 'Extract Links',
    description:
      'Extract all video URLs from any YouTube channel or playlist and save them to a TXT file.',
    icon: '⊞',
    path: '/extract-links',
    gradient: 'from-red-600/20 to-red-800/10',
  },
  {
    title: 'Extract Text',
    description:
      'Download YouTube audio and transcribe it to text using AI. Audio files are removed automatically.',
    icon: '⊡',
    path: '/extract-text',
    gradient: 'from-red-600/20 to-red-800/10',
  },
  {
    title: 'Extract MP3',
    description:
      'Download audio from YouTube videos as MP3 files. Fast and simple batch processing.',
    icon: '♪',
    path: '/extract-mp3',
    gradient: 'from-red-600/20 to-red-800/10',
  },
  {
    title: 'Extract MP3 + Text',
    description:
      'Download audio and generate transcriptions simultaneously. Get both MP3 and text output.',
    icon: '♫',
    path: '/extract-mp3-text',
    gradient: 'from-red-600/20 to-red-800/10',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gradient">Dashboard</h2>
        <p className="text-gray-500">Choose an operation to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <FeatureCard key={f.path} {...f} index={i} />
        ))}
      </div>

      <div className="card text-sm space-y-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <p className="font-medium text-gray-400">Quick Start</p>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-gray-500 ml-4">
          <li>Click a feature tab above or a card below</li>
          <li>Enter a URL or pick a TXT file, then select an output folder</li>
          <li>Click Start and monitor progress in real-time</li>
        </ol>
      </div>
    </div>
  )
}
