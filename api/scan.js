import admin from 'firebase-admin';

// Inizializzazione posticipata dentro l'handler per catturare gli errori reali
function initFirebase() {
  if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY;
    if (pk) {
      pk = pk.replace(/^"|"$/g, ''); // Rimuove eventuali virgolette all'inizio o fine
      pk = pk.replace(/\\n/g, '\n'); // Sostituisce gli a-capo "testuali" con veri a-capo
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: pk,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
}

export default async function handler(req, res) {
  try {
    initFirebase();
  } catch (initErr) {
    console.error("ERRORE CHIAVI FIREBASE:", initErr);
    return res.status(500).json({ error: 'Errore configurazione chiavi Firebase', details: initErr.message });
  }
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const studentId = req.query.id;

  if (!studentId) {
    return res.status(400).json({ error: 'ID mancante' });
  }

  try {
    const db = admin.database();
    const ref = db.ref(`scansions/${studentId}`);
    
    // Salva lo stato su Firebase
    await ref.set({
      status: 'IN_CORSO',
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
    
    console.log(`Studente scansionato registrato su Firebase: ${studentId}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Errore durante il salvataggio su Firebase:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
