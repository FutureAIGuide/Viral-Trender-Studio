import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return <h2>Home</h2>
}

function About() {
  return <h2>About</h2>
}

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}