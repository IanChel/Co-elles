import React from 'react';

export default function Onboarding({ go }) {
  return (
    <div className="pad" style={{height:'100%', display:'flex', flexDirection:'column',
      justifyContent:'center', background:'linear-gradient(160deg,#5A3E85,#432e63)', color:'#fff'}}>
      <div className="center">
        <div style={{fontSize:64}}>🛡️</div>
        <h1 className="brand" style={{fontSize:42, color:'#fff', marginTop:8}}>Co-Elles</h1>
        <p style={{color:'#F28C8C', fontStyle:'italic', fontSize:16, marginTop:4}}>
          Le trajet en toute confiance
        </p>
      </div>

      <p style={{textAlign:'center', marginTop:36, lineHeight:1.5, opacity:.9}}>
        La première application de covoiturage<br/><b>100% féminin</b> en France.
      </p>

      <div className="row" style={{justifyContent:'center', gap:8, margin:'24px 0 36px'}}>
        <span className="badge rose">🚗 Sécurité</span>
        <span className="badge rose">🤝 Sororité</span>
        <span className="badge rose">🌸 Bienveillance</span>
      </div>

      <button className="btn btn-accent" onClick={()=>go('register')}>Commencer</button>
      <button className="btn" style={{background:'transparent', color:'#fff', marginTop:6}}
        onClick={()=>go('register')}>J'ai déjà un compte</button>
    </div>
  );
}
