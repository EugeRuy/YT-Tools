import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import ExtractLinksPage from './pages/ExtractLinksPage'
import ExtractTextPage from './pages/ExtractTextPage'
import ExtractMp3Page from './pages/ExtractMp3Page'
import ExtractMp3AndTextPage from './pages/ExtractMp3AndTextPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/extract-links" element={<ExtractLinksPage />} />
            <Route path="/extract-text" element={<ExtractTextPage />} />
            <Route path="/extract-mp3" element={<ExtractMp3Page />} />
            <Route path="/extract-mp3-text" element={<ExtractMp3AndTextPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  )
}
