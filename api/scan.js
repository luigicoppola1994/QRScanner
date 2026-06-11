import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Leggi l'ID dallo URL /api/scan?id=...
  const studentId = req.query.id;

  if (!studentId) {
    return res.status(400).json({ error: 'ID mancante' });
  }

  try {
    // Salva l'ID nel database Vercel KV con scadenza di 2 ore (7200 secondi)
    // Impostiamo lo stato su "IN_CORSO"
    await kv.set(`status_${studentId}`, 'IN_CORSO', { ex: 7200 });
    
    console.log(`Studente scansionato registrato in KV: ${studentId}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Errore durante il salvataggio in KV:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
