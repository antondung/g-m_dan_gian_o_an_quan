import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../nhân vật và hoạt cảnh/source cần để dựng hình/src/App'
import '../nhân vật và hoạt cảnh/source cần để dựng hình/src/styles.css'
import '../nhân vật và hoạt cảnh/source cần để dựng hình/src/polish.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
