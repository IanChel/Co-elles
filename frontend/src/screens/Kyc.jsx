import React, { useState } from 'react';
import { api } from '../api.js';

const STEPS = [
  { ico:'📄', label:'Pièce d\'identité', desc:'CNI ou passeport' },
  { ico:'🤳', label:'Selfie en direct', desc:'Liveness check anti-usurpation' },
  { ico:'🤖', label:'IA de vérification', desc:'Reconnaissance faciale' },
  { ico:'👩‍💼', label:'Validation humaine', desc:'Équipe de modération' },
];

export default function Kyc({ go, user, setUser }) {
  const [step, setStep]   = useState(-1);   // -1 = écran d'intro
  const [done, setDone]   = useState(false);

  // simule le passage des étapes une par une
  function start() {
    setStep(0);
    let i = 0;
    const timer = setInterval(async () => {
      i++;
      if (i >= STEPS.length) {
        clearInterval(timer);
        try { const u = await api.certify(user.id); setUser(u); } catch {}
        setDone(true);
      }
      setStep(i);
    }, 900);
  }

  if (done) {
    return (
      <div className="pad center" style={{height:'100%', display:'flex', flexDirection:'column', justifyContent:'center'}}>
        <div style={{fontSize:72}}>✅</div>
        <h1 className="title" style={{marginTop:10}}>Profil Certifié !</h1>
        <p className="subtitle">Votre identité a été vérifiée.<br/>Bienvenue dans la communauté Co-Elles.</p>
        <div style={{margin:'20px 0'}}><span className="badge">🛡️ Badge Certifiée</span></div>
        <button className="btn btn-primary" onClick={()=>go('home')}>Découvrir les trajets</button>
      </div>
    );
  }

  return (
    <div className="pad">
      <h1 className="title">Le Verrou de Sécurité</h1>
      <p className="subtitle" style={{marginBottom:18}}>Vérification KYC pour garantir un espace 100% féminin</p>

      <div className="card" style={{background:'var(--rose-light)', border:'none', marginBottom:18}}>
        <p style={{fontSize:13, color:'#c0506b'}}>🔒 Données traitées selon le RGPD — prestataire KYC agréé</p>
      </div>

      {STEPS.map((s, i) => {
        const active = step >= i;
        const current = step === i && step < STEPS.length;
        return (
          <div key={i} className="card" style={{marginBottom:10, opacity: active?1:.45,
            borderLeft:`4px solid ${active?'var(--violet)':'#e6e0ef'}`,
            transition:'opacity .3s'}}>
            <div className="row">
              <span style={{fontSize:24}}>{s.ico}</span>
              <div>
                <div style={{fontWeight:600, fontSize:14}}>{s.label}</div>
                <div className="muted">{s.desc}</div>
              </div>
              <span className="spacer"></span>
              {active && <span style={{color:'var(--violet)'}}>{current ? '⏳' : '✓'}</span>}
            </div>
          </div>
        );
      })}

      {step === -1 && (
        <button className="btn btn-primary" style={{marginTop:10}} onClick={start}>
          Lancer la vérification
        </button>
      )}
    </div>
  );
}
