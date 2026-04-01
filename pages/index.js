import Head from 'next/head'
import { useState } from 'react'
import Layout from '../components/Layout'
import Overview from '../components/tabs/Overview'
import LocalSEO from '../components/tabs/LocalSEO'
import Reviews from '../components/tabs/Reviews'
import ComingSoon from '../components/tabs/ComingSoon'

export async function getServerSideProps() {
  return { props: {} }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')

  function renderTab() {
    switch (activeTab) {
      case 'overview':    return <Overview onTabChange={setActiveTab} />
      case 'local-seo':  return <LocalSEO />
      case 'reviews':    return <Reviews />
      default:           return <ComingSoon tab={activeTab} />
    }
  }

  return (
    <>
      <Head>
        <title>CC Hair &amp; Beauty — Intelligence Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTab()}
      </Layout>
    </>
  )
}
