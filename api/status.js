import admin from 'firebase-admin';

function initFirebase() {
  if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY;
    if (pk) {
      pk = pk.replace(/^"|"$/g, '');
      pk = pk.replace(/\\n/g, '\n');
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
    return res.status(200).json({ status: 'ATTESA', error: 'Errore configurazione chiavi Firebase' });
  }
  // Disabilita la cache
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const studentId = req.query.id;
  const reset = req.query.reset;

  if (!studentId) {
    return res.status(400).json({ error: 'ID mancante' });
  }

  // Sanitizzazione per chiavi Firebase (i punti '.' e altri caratteri speciali non sono ammessi)
  const safeStudentId = studentId.replace(/\./g, ',').replace(/#/g, '-').replace(/\$/g, '-').replace(/\[/g, '-').replace(/\]/g, '-');

  try {
    const db = admin.database();
    const ref = db.ref(`scansions/${safeStudentId}`);
    
    if (reset === 'true') {
      await ref.set({
        status: 'ATTESA',
        timestamp: admin.database.ServerValue.TIMESTAMP
      });
      return res.status(200).json({ status: 'ATTESA' });
    }
    
    // Leggi lo stato da Firebase
    const snapshot = await ref.once('value');
    const data = snapshot.val();

    if (data && data.status) {
      return res.status(200).json({ status: data.status });
    } else {
      return res.status(200).json({ status: 'ATTESA' });
    }
  } catch (error) {
    console.error('Errore durante la lettura o scrittura su Firebase:', error);
    return res.status(200).json({ status: 'ATTESA', error: 'Errore DB' });
  }
}
