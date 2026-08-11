import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: 40}}>
      <h1>Woobox Shop</h1>
      <p>A aplicação foi preparada para publicação no GitHub Pages.</p>
      <p>Se esta página aparecer, o deploy do Vite está funcionando corretamente.</p>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
