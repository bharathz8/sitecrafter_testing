import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CakeWebsite from './pages/testing'

export default function App() {
  return (

    <Routes>
      <Route path="/" element={<CakeWebsite />} />
    </Routes>

  )
}
