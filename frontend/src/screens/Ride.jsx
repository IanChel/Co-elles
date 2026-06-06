import React, { useEffect, useState } from 'react';

export default function Ride({ go, trip }) {
  const [progress, setProgress] = useState(0);   // 0 → 100 le long du trajet
  const [sos, setSos] = useState(false);
  const [shared, setShared] = useState(false);

  // simule l'avancement du véhicule sur la carte
  useEffect(() => {
    const t = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 400);
    return () => clearInterval(t);
  }, []);

  // position du point mobile le long d'une courbe SVG
  const px = 40 + (progress/100) * 270;
  const py = 230 - Math.sin((progress/100) * Math.PI) * 120;

  return (
    <div className="screen" style={{position:'relative'}}>
      {/* --- Fausse carte --- */}
      <div style={{position:'relative', height:380, background:'#eee8f4', overflow:'hidden'}}>
        <svg viewBox="0 0 350 380" style={{width:'100%', height:'100%'}}>
          {/* rues décoratives */}
          {[60,140,220,300].map(y=><line key={y} x1="0" y1={y} x2="350" y2={y} stroke="#ddd4ea" strokeWidth="8"/>)}
          {[70,170,270].map(x=><line key={x} x1={x} y1="0" x2={x} y2="380" stroke="#ddd4ea" strokeWidth="8"/>)}
          {/* itinéraire */}
          <path d="M40 230 Q175 30 310 230" fill="none" stroke="#5A3E85" strokeWidth="5" strokeDasharray="2 0" strokeLinecap="round"/>
          {/* départ / arrivée */}
          <circle cx="40" cy="230" r="9" fill="#5A3E85"/>
          <circle cx="310" cy="230" r="9" fill="#F28C8C"/>
          {/* véhicule */}
          <circle cx={px} cy={py} r="12" fill="#F28C8C" stroke="#fff" strokeWidth="3"/>
          <text x={px} y={py+4} textAnchor="middle" fontSize="12">🚗</text>
        </svg>
        <div style={{position:'absolute', top:14, left:14}} className="badge">📍 Suivi GPS temps réel</div>
        <button onClick={()=>go('home')} style={{position:'absolute', top:12, right:12,
          border:'none', background:'#fff', borderRadius:12, padding:'6px 10px', cursor:'pointer', boxShadow:'var(--shadow)'}}>✕</button>
      </div>

      {/* --- Infos trajet --- */}
      <div className="pad" style={{flex:1}}>
        <div className="row">
          <div>
            <div style={{fontWeight:600}}>{trip?.origin} → {trip?.destination}</div>
            <div className="muted">Avec {trip?.driver_name} · {progress<100?'En cours':'Arrivée ✅'}</div>
          </div>
          <span className="spacer"></span>
          <div style={{fontWeight:700, color:'var(--violet)', fontFamily:'Syne'}}>{progress}%</div>
        </div>

        <div style={{height:6, background:'#eee', borderRadius:99, margin:'12px 0 18px'}}>
          <div style={{height:'100%', width:`${progress}%`, background:'var(--violet)', borderRadius:99, transition:'width .3s'}}/>
        </div>

        {/* Anges Gardiens */}
        <div className="card" style={{marginBottom:12}}>
          <div className="row">
            <span style={{fontSize:22}}>👼</span>
            <div>
              <div style={{fontWeight:600, fontSize:14}}>Anges Gardiens</div>
              <div className="muted">{shared ? 'Trajet partagé avec 3 proches' : 'Partagez votre trajet en temps réel'}</div>
            </div>
            <span className="spacer"></span>
            <button className="btn" style={{width:'auto', padding:'8px 12px', fontSize:12,
              background: shared?'var(--violet-light)':'var(--violet)', color: shared?'var(--violet)':'#fff'}}
              onClick={()=>setShared(true)}>{shared?'Partagé ✓':'Partager'}</button>
          </div>
        </div>

        {/* Bouton SOS */}
        <button className="btn btn-accent" style={{fontFamily:'Syne', fontSize:20, letterSpacing:2, padding:18}}
          onClick={()=>setSos(true)}>🆘 SOS</button>
        <p className="muted center" style={{marginTop:8}}>Alerte instantanée + géolocalisation aux Anges Gardiens</p>
      </div>

      {/* --- Overlay SOS --- */}
      {sos && (
        <div style={{position:'absolute', inset:0, background:'rgba(242,140,140,.96)', color:'#fff',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:30, zIndex:100}}>
          <div style={{fontSize:64}}>🆘</div>
          <h1 className="brand" style={{color:'#fff', fontSize:30, marginTop:10}}>Alerte envoyée</h1>
          <p className="center" style={{marginTop:12, lineHeight:1.6}}>
            ✓ Géolocalisation transmise<br/>
            ✓ Anges Gardiens prévenus<br/>
            ✓ Connexion aux services d'urgence
          </p>
          <button className="btn" style={{background:'#fff', color:'#c0506b', marginTop:28}}
            onClick={()=>setSos(false)}>Je suis en sécurité</button>
        </div>
      )}
    </div>
  );
}
