import { AuthProvider } from '../components/Auth'
import { globalStyles } from '../lib/theme'

export default function App({ Component, pageProps }) {
  return (
    <>
      <style>{globalStyles}</style>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  )
}
