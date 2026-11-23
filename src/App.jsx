import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PuzzlePage from './pages/PuzzlePage'
import NotFoundPage from './pages/NotFoundPage'
import DevRotatePage from './pages/DevRotatePage'
import DevCubePage from './pages/DevCubePage'

export default function App() {
  return (
    <Routes>
      <Route path="dev/pyraminx" element={<DevRotatePage />} />
      <Route path="dev/cube" element={<DevCubePage />} />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="puzzle/:puzzleSlug" element={<PuzzlePage />} />
        <Route path="puzzle/:puzzleSlug/:stageSlug" element={<div>Stage page coming soon</div>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
