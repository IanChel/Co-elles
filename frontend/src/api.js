// Point d'entree unique vers l'API backend
const BASE = 'http://localhost:4000/api';

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || 'Erreur');
  }
  return res.json();
}

export const api = {
  register: (data) => req('/register', { method: 'POST', body: JSON.stringify(data) }),
  login:    (data) => req('/login',    { method: 'POST', body: JSON.stringify(data) }),
  certify:  (id)   => req(`/users/${id}/certify`, { method: 'POST' }),
  profile:  (id)   => req(`/users/${id}`),
  trips:    ()     => req('/trips'),
  trip:     (id)   => req(`/trips/${id}`),
  book:     (data) => req('/bookings', { method: 'POST', body: JSON.stringify(data) }),
};
