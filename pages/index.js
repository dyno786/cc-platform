import Head from 'next/head'
import dynamic from 'next/dynamic'

const App = dynamic(() => import('../components/App'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>CC Hair &amp; Beauty — Intelligence Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <App />
    </>
  )
}
