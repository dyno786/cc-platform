import Head from 'next/head'
import Shell from '../components/Shell'
import { useAuth } from '../components/Auth'
import { T } from '../lib/theme'

export default function PaidAds() {
  const { isManager } = useAuth()

  return (
    <>
      <Head><title>Paid Ads — CC Intelligence</title></Head>
      <Shell title="Paid Ads" subtitle="2yr deep analysis — Google Ads data">
        {!isManager ? (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:40,textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12}}>🔒</div>
            <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:6}}>Manager access only</div>
            <div style={{fontSize:13,color:T.textMuted}}>Financial data is restricted to manager login. Sign out and enter the manager PIN to access this page.</div>
          </div>
        ) : (
          <div style={{background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:8,padding:20,color:T.text,fontSize:13}}>
            <p style={{color:T.textMuted}}>Paid Ads deep analysis — full rebuild coming in next session.</p>
          </div>
        )}
      </Shell>
    </>
  )
}
