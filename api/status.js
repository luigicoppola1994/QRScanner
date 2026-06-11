import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Disabilita la cache per evitare che il cellulare legga dati vecchi
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

  if (!studentId) {
    return res.status(400).json({ error: 'ID mancante' });
  }

  try {
    // Leggi lo stato dal database KV
    const status = await kv.get(`status_${studentId}`);

    if (status === 'IN_CORSO') {
      return res.status(200).json({ status: 'IN_CORSO' });
    } else {
      return res.status(200).json({ status: 'ATTESA' });
    }
  } catch (error) {
    console.error('Errore durante la lettura da KV:', error);
    // Anche in caso di errore, rispondiamo in ATTESA per non bloccare il client, 
    // o con 500 se preferiamo. Usiamo ATTESA per continuità.
    return res.status(200).json({ status: 'ATTESA', error: 'Errore KV' });
  }
}
