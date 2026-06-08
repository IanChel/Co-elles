const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Trip = require('./models/Trip');
const SOSAlert = require('./models/SOSAlert');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB pour le seed');

    // --- Vider les collections ---
    await User.deleteMany({});
    await Trip.deleteMany({});
    await SOSAlert.deleteMany({});
    console.log('🗑️  Collections vidées');

    // --- Créer les utilisatrices ---
    // On utilise User.create() pour déclencher le hook pre-save (hash du password)
    const marie = await User.create({
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie@coelles.fr',
      password: 'password123',
      phone: '06 12 34 56 78',
      isKYCVerified: true,
      emergencyContact: { name: 'Jean Martin', phone: '06 98 76 54 32' },
    });

    const sophie = await User.create({
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'sophie@coelles.fr',
      password: 'password123',
      phone: '06 11 22 33 44',
      isKYCVerified: true,
      emergencyContact: { name: 'Luc Bernard', phone: '06 55 66 77 88' },
    });

    const claire = await User.create({
      firstName: 'Claire',
      lastName: 'Dubois',
      email: 'claire@coelles.fr',
      password: 'password123',
      phone: '06 22 33 44 55',
      isKYCVerified: true,
      emergencyContact: { name: 'Anne Dubois', phone: '06 44 55 66 77' },
    });

    const emma = await User.create({
      firstName: 'Emma',
      lastName: 'Leroy',
      email: 'emma@coelles.fr',
      password: 'password123',
      phone: '06 33 44 55 66',
      isKYCVerified: true,
      emergencyContact: { name: 'Pierre Leroy', phone: '06 77 88 99 00' },
    });

    console.log('👤 4 utilisatrices créées');

    // --- Créer les trajets ---
    await Trip.create([
      {
        driver: sophie._id,
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        date: '2026-06-15',
        time: '14:30',
        seats: 3,
        price: 25,
        passengers: [],
      },
      {
        driver: claire._id,
        departureCity: 'Marseille',
        arrivalCity: 'Nice',
        date: '2026-06-16',
        time: '09:00',
        seats: 2,
        price: 15,
        passengers: [],
      },
      {
        driver: emma._id,
        departureCity: 'Toulouse',
        arrivalCity: 'Bordeaux',
        date: '2026-06-15',
        time: '18:00',
        seats: 1,
        price: 20,
        passengers: [],
      },
      {
        // Trajet complet (0 places restantes)
        driver: sophie._id,
        departureCity: 'Lyon',
        arrivalCity: 'Grenoble',
        date: '2026-06-14',
        time: '10:00',
        seats: 2,
        price: 12,
        passengers: [marie._id, emma._id], // Déjà plein
      },
    ]);

    console.log('🚗 4 trajets créés (dont 1 complet)');

    // --- Résumé ---
    console.log('');
    console.log('══════════════════════════════════════');
    console.log('  🌱 SEED TERMINÉ AVEC SUCCÈS');
    console.log('══════════════════════════════════════');
    console.log('');
    console.log('  Comptes de test (mot de passe : password123) :');
    console.log('  • marie@coelles.fr  — Utilisatrice principale de la démo');
    console.log('  • sophie@coelles.fr — Conductrice (Paris→Lyon, Lyon→Grenoble)');
    console.log('  • claire@coelles.fr — Conductrice (Marseille→Nice)');
    console.log('  • emma@coelles.fr   — Conductrice (Toulouse→Bordeaux)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.message);
    process.exit(1);
  }
};

seed();
