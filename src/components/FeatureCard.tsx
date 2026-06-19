import { useNavigate } from 'react-router-dom'
import { useStore } from '../stores/useStore'

interface FeatureCardProps {
  title: string
  description: string
  icon: string
  path: string
  gradient: string
  index?: number
}

export default function FeatureCard({
  title,
  description,
  icon,
  path,
  gradient,
  index = 0,
}: FeatureCardProps) {
  const navigate = useNavigate()
  const isRunning = useStore((s) => s.isRunning)

  return (
    <button
      onClick={() => navigate(path)}
      disabled={isRunning}
      style={{ animationDelay: `${index * 100}ms` }}
      className="group relative overflow-hidden rounded-2xl border border-surface-border/60 bg-surface-card p-6 text-left transition-all duration-300 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-surface-border/60 disabled:hover:shadow-none w-full animate-fade-in-up"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all duration-700" />

      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${gradient}`}
          style={{
            background: `linear-gradient(135deg, rgba(220,38,38,0.15), rgba(220,38,38,0.05))`,
          }}
        >
          <span className="text-red-400 group-hover:text-red-300 transition-colors">
            {icon}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mt-2 leading-relaxed group-hover:text-gray-400 transition-colors">
          {description}
        </p>
      </div>

      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-surface-lighter/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300">
        <span className="text-red-400 text-sm">→</span>
      </div>
    </button>
  )
}
