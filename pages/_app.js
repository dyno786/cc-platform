import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Apply saved theme and font size on load
    try {
      const t = localStorage.getItem('cc_theme') || 'dark'
      const f = parseInt(localStorage.getItem('cc_fontsize') || '14')
      const isLight = t === 'light'
      document.body.style.background = isLight ? '#f8f9fb' : '#0f1117'
      document.body.style.color = isLight ? '#111827' : '#e8eaf0'
      document.body.style.fontSize = f + 'px'
      document.body.setAttribute('data-theme', t)
    } catch(e) {}
  }, [])

  return <Component {...pageProps} />
}
