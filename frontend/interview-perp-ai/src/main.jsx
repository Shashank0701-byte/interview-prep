import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "dummy_key_for_dev"}>
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>,
)
