import { useState } from 'react'
import Layout from './Layout'
import Overview from './tabs/Overview'
import LocalSEO from './tabs/LocalSEO'
import Reviews from './tabs/Reviews'
import ComingSoon from './tabs/ComingSoon'

export default function App() {
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
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
    </Layout>
  )
}
