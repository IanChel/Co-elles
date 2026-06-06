import React, { useState } from 'react';
import Onboarding from './screens/Onboarding.jsx';
import Register   from './screens/Register.jsx';
import Kyc        from './screens/Kyc.jsx';
import Home       from './screens/Home.jsx';
import TripDetail from './screens/TripDetail.jsx';
import Ride       from './screens/Ride.jsx';
import Profile    from './screens/Profile.jsx';

// Navigation simple par "écran courant" (pile mobile), sans librairie de routing.
export default function App() {
  const [screen, setScreen] = useState('onboarding');
  const [user, setUser]     = useState(null);   // utilisatrice connectée
  const [trip, setTrip]     = useState(null);   // trajet sélectionné

  const go = (s) => setScreen(s);

  const props = { go, user, setUser, trip, setTrip };

  const screens = {
    onboarding: <Onboarding {...props} />,
    register:   <Register   {...props} />,
    kyc:        <Kyc        {...props} />,
    home:       <Home       {...props} />,
    trip:       <TripDetail {...props} />,
    ride:       <Ride       {...props} />,
    profile:    <Profile    {...props} />,
  };

  // écrans avec barre de navigation basse
  const withTabs = ['home', 'profile'];
  const showTabs = withTabs.includes(screen);

  return (
    <div className="phone">
      <div className="screen">{screens[screen]}</div>
      {showTabs && (
        <nav className="tabbar">
          <button className={`tab ${screen==='home'?'active':''}`} onClick={()=>go('home')}>
            <span className="ico">🚗</span>Trajets
          </button>
          <button className={`tab ${screen==='profile'?'active':''}`} onClick={()=>go('profile')}>
            <span className="ico">👤</span>Profil
          </button>
        </nav>
      )}
    </div>
  );
}
