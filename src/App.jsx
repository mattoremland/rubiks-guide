import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PuzzlePage from './pages/PuzzlePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="puzzle/:puzzleSlug" element={<PuzzlePage />} />
        <Route path="puzzle/:puzzleSlug/:stageSlug" element={<div>Stage page coming soon</div>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
