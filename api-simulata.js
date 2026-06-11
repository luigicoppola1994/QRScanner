/**
 * api-simulata.js
 * Questo file simula le chiamate al server (backend) e gestisce la persistenza locale.
 * Serve a creare un prototipo funzionante usando localStorage al posto di un database.
 */

// Set per evitare registrazioni duplicate nello stesso secondo (debouncing)
const recentScans = new Set();

/**
 * Simula il salvataggio dei dati sul server.
 * Questa funzione viene chiamata da docente.html quando il PC inquadra un QR code.
 */
window.saveScannedStudent = function(studentId) {
    console.log(`[PC] Inviando scansione al vero server per: ${studentId}`);
    
    // Invia al backend Python
    fetch(`/api/scan?id=${studentId}`)
        .then(res => res.json())
        .then(data => console.log('Server ha confermato la scansione:', data))
        .catch(err => console.error('Errore durante la chiamata API:', err));

    // Oggetto record dello studente (salviamo comunque lo storico su PC)
    const record = {
        id: studentId,
        timestamp: new Date().toISOString(),
        status: 'IN_CORSO' // Il PC imposta lo stato su "IN_CORSO"
    };

    // Salviamo nello storico generale delle scansioni
    let records = JSON.parse(localStorage.getItem('its_scansions') || '[]');
    records.push(record);
    localStorage.setItem('its_scansions', JSON.stringify(records));
    
    // Aggiungiamo ai recenti per evitare spam (blocco per 3 secondi)
    recentScans.add(studentId);
    setTimeout(() => {
        recentScans.delete(studentId);
    }, 3000); 
};

/**
 * Controlla se il QR è stato già scannerizzato di recente
 */
window.isRecentlyScanned = function(studentId) {
    return recentScans.has(studentId);
};

/**
 * Simula la GET API da parte del cellulare (polling).
 * Questa funzione viene chiamata da index.html (il cellulare).
 * 
 * IMPORTANTE: Senza un vero server (es. Node.js), il localStorage non viene condiviso 
 * tra due dispositivi diversi (cellulare e PC). Questa funzione leggerà lo status
 * solo se PC e cellulare condividono lo stesso browser (es. aprendo 2 tab sullo stesso PC).
 */
window.checkSimulatedStatus = function(studentId) {
    return localStorage.getItem(`status_${studentId}`);
};
