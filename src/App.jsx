import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Simulator from './pages/Simulator'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulador" element={<Simulator />} />
      </Routes>
    </BrowserRouter>
  )
}