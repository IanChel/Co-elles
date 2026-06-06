import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Home({ go, user, setTrip }) {
  const [trips, setTrips] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.trips().then(setTrips).catch(e => setErr(e.message));
  }, []);

  const filtered = trips.filter(t =>
    (t.origin + t.destination).toLowerCase().includes(q.toLowerCase()));

  const heure = (d) => new Date(d).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});

  return (
    <div className="pad">
      <div className="row">
        <div>
          <p className="muted">Bonjour 👋</p>
          <h1 className="title" style={{fontSize:22}}>{user?.name?.split(' ')[0] || 'Bienvenue'}</h1>
        </div>
        <span className="spacer"></span>
        {user?.is_certified && <span className="badge">🛡️ Certifiée</span>}
      </div>

      <input className="field" style={{marginTop:16}} placeholder="🔍 Où allez-vous ?"
        value={q} onChange={e=>setQ(e.target.value)} />

      <h3 style={{color:'var(--violet)', fontSize:16, margin:'8px 0 12px'}}>Trajets disponibles</h3>
      {err && <p style={{color:'#c0506b', fontSize:13}}>⚠️ {err} — l'API backend est-elle lancée ?</p>}

      {filtered.map(t => (
        <div key={t.id} className="card" style={{marginBottom:12, cursor:'pointer'}}
          onClick={()=>{ setTrip(t); go('trip'); }}>
          <div className="row">
            <div style={{fontWeight:600, fontSize:15}}>{t.origin}</div>
            <span className="spacer"></span>
            <div style={{fontWeight:700, color:'var(--rose)'}}>{Number(t.price).toFixed(2)} €</div>
          </div>
          <div className="muted" style={{margin:'2px 0 8px'}}>→ {t.destination}</div>
          <div className="row" style={{gap:6, flexWrap:'wrap'}}>
            <span className="badge">👩 {t.driver_name}</span>
            {t.driver_certified ? <span className="badge">🛡️ Vérifiée</span> : null}
            <span className="badge rose">⭐ {Number(t.driver_score).toFixed(1)}</span>
            <span className="spacer"></span>
            <span className="muted">🕑 {heure(t.departure_time)} · {t.seats} pl.</span>
          </div>
        </div>
      ))}
      {filtered.length===0 && !err && <p className="muted center">Aucun trajet trouvé.</p>}
    </div>
  );
}
