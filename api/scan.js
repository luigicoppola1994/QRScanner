import admin from 'firebase-admin';

// Inizializza Firebase solo se non è già stato fatto (fondamentale per Vercel)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Sostituisce i caratteri di a-capo se la variabile di ambiente li ha formattati male
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.error('Firebase initialization error', error.stack);
  }
}

export default async function handler(req, res) {
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
