import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode disabled: camera pipeline mounts once (avoid double MediaPipe graphs in dev)
createRoot(document.getElementById('root')!).render(<App />)