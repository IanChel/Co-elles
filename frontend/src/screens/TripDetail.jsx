import React, { useState } from 'react';
import { api } from '../api.js';

export default function TripDetail({ go, user, trip }) {
  const [booked, setBooked] = useState(false);
  const heure = (d) => new Date(d).toLocaleString('fr-FR', {weekday:'long', hour:'2-digit', minute:'2-digit'});

  async function reserve() {
    try { await api.book({ trip_id: trip.id, passenger_id: user.id }); setBooked(true); }
    catch (e) { alert(e.message); }
  }

  return (
    <div className="pad">
      <button className="muted" style={{border:'none',background:'none',cursor:'pointer'}} onClick={()=>go('home')}>← Trajets</button>

      <h1 className="title" style={{marginTop:12}}>Détail du trajet</h1>

      <div className="card" style={{margin:'16px 0'}}>
        <div className="row" style={{marginBottom:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'var(--violet-light)',
            display:'flex',alignItems:'center',justifyContent:'center'}}>👩</div>
          <div>
            <div style={{fontWeight:600}}>{trip.driver_name}</div>
            <div className="muted">⭐ {Number(trip.driver_score).toFixed(1)} · Niveau de confiance élevé</div>
          </div>
          <span className="spacer"></span>
          {trip.driver_certified ? <span className="badge">🛡️</span> : null}
        </div>
        <hr style={{border:'none', borderTop:'1px solid #f0ebf7', margin:'8px 0'}}/>
        <p style={{margin:'8px 0'}}>📍 <b>Départ</b> : {trip.origin}</p>
        <p style={{margin:'8px 0'}}>🏁 <b>Arrivée</b> : {trip.destination}</p>
        <p style={{margin:'8px 0'}}>🕑 {heure(trip.departure_time)}</p>
        {trip.preferences && <p className="muted" style={{marginTop:8}}>🎵 {trip.preferences}</p>}
      </div>

      <div className="row" style={{marginBottom:16}}>
        <span className="muted">Prix du trajet</span>
        <span className="spacer"></span>
        <span style={{fontSize:24, fontWeight:700, color:'var(--rose)', fontFamily:'Syne'}}>{Number(trip.price).toFixed(2)} €</span>
      </div>

      {!booked ? (
        <button className="btn btn-primary" onClick={reserve}>Réserver ce trajet</button>
      ) : (
        <>
          <div className="card center" style={{background:'var(--violet-light)', border:'none', marginBottom:12}}>
            ✅ Réservation confirmée !
          </div>
          <button className="btn btn-accent" onClick={()=>go('ride')}>Démarrer le suivi du trajet</button>
        </>
      )}
    </div>
  );
}
