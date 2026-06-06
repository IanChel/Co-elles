import React from 'react';

export default function Profile({ go, user, setUser }) {
  const prefs = ['🔇 Silence', '🎵 Musique', '🐾 Animaux OK', '🚭 Non-fumeur'];

  return (
    <div className="pad">
      <h1 className="title">Mon Profil</h1>

      <div className="card center" style={{margin:'16px 0'}}>
        <div style={{width:70,height:70,borderRadius:'50%',background:'var(--violet-light)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:32, margin:'0 auto 10px'}}>👩</div>
        <div style={{fontWeight:700, fontSize:18, fontFamily:'Syne'}}>{user?.name || 'Utilisatrice'}</div>
        <div className="muted">{user?.email}</div>
        <div className="row" style={{justifyContent:'center', gap:6, marginTop:10}}>
          {user?.is_certified && <span className="badge">🛡️ Certifiée</span>}
          <span className="badge rose">⭐ {Number(user?.trust_score ?? 5).toFixed(1)} confiance</span>
        </div>
      </div>

      <h3 style={{color:'var(--violet)', fontSize:15, margin:'4px 0 10px'}}>Mes préférences de trajet</h3>
      <div className="row" style={{flexWrap:'wrap', gap:8, marginBottom:18}}>
        {prefs.map(p=><span key={p} className="badge" style={{padding:'8px 12px'}}>{p}</span>)}
      </div>

      <div className="card" style={{marginBottom:10}}>
        <div className="row"><span>🛡️</span><span style={{marginLeft:8}}>Profil vérifié KYC</span><span className="spacer"></span><span style={{color:'var(--violet)'}}>✓</span></div>
      </div>
      <div className="card" style={{marginBottom:18}}>
        <div className="row"><span>💬</span><span style={{marginLeft:8}}>Messagerie sécurisée</span><span className="spacer"></span><span className="muted">Activée</span></div>
      </div>

      <button className="btn btn-ghost" onClick={()=>{ setUser(null); go('onboarding'); }}>Se déconnecter</button>
    </div>
  );
}
