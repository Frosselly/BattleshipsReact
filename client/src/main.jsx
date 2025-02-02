import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const UserContext = createContext(null)

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <UserContext.Provider>
    <App />
  </UserContext.Provider>
  // </StrictMode>,
)
