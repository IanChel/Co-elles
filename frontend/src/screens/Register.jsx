import React, { useState } from 'react';
import { api } from '../api.js';

export default function Register({ go, setUser }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role:'passagere' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError(''); setLoading(true);
    try {
      const u = await api.register(form);
      setUser(u);
      go('kyc');                       // étape KYC obligatoire après inscription
    } catch (e) {
      // si l'email existe déjà (compte démo), on tente la connexion
      try { const u = await api.login({ email: form.email, password: form.password });
        setUser(u); go(u.is_certified ? 'home' : 'kyc'); }
      catch { setError(e.message); }
    } finally { setLoading(false); }
  }

  return (
    <div className="pad">
      <button className="muted" style={{border:'none',background:'none',cursor:'pointer'}} onClick={()=>go('onboarding')}>← Retour</button>
      <h1 className="title" style={{marginTop:12}}>Créer mon compte</h1>
      <p className="subtitle" style={{marginBottom:20}}>Rejoignez une communauté de confiance</p>

      <input className="field" placeholder="Nom complet" value={form.name} onChange={set('name')} />
      <input className="field" placeholder="Email" type="email" value={form.email} onChange={set('email')} />
      <input className="field" placeholder="Téléphone" value={form.phone} onChange={set('phone')} />
      <input className="field" placeholder="Mot de passe" type="password" value={form.password} onChange={set('password')} />

      <div className="row" style={{gap:8, marginBottom:16}}>
        {['passagere','conductrice'].map(r=>(
          <button key={r} onClick={()=>setForm({...form, role:r})}
            className="btn" style={{padding:'10px', fontSize:13,
              background: form.role===r ? 'var(--violet)' : 'var(--violet-light)',
              color: form.role===r ? '#fff' : 'var(--violet)'}}>
            {r==='passagere'?'Passagère':'Conductrice'}
          </button>
        ))}
      </div>

      {error && <p style={{color:'#c0506b', fontSize:13, marginBottom:10}}>⚠️ {error}</p>}
      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        {loading ? '...' : 'Continuer'}
      </button>
      <p className="muted center" style={{marginTop:14}}>
        Compte démo : <b>camille@demo.fr</b> / <b>demo1234</b>
      </p>
    </div>
  );
}
