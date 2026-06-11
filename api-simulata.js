/**
 * api-simulata.js
 * Funzioni di utilità per chiamare il backend (su Vercel).
 */

const recentScans = new Set();

/**
 * Invia la scansione al server Vercel.
 */
window.saveScannedStudent = async function(studentId) {
    console.log(`[PC] Inviando scansione al vero server per: ${studentId}`);
    try {
        const res = await fetch(`/api/scan?id=${studentId}`);
        const data = await res.json();
        return data.action || 'ENTRATA';
    } catch (err) {
        console.error('Errore durante la chiamata API:', err);
        return 'ERRORE';
    }
};

/**
 * Controlla se il QR è stato già scannerizzato di recente
 */
window.isRecentlyScanned = function(studentId) {
    return recentScans.has(studentId);
};

window.markRecentlyScanned = function(studentId) {
    recentScans.add(studentId);
    setTimeout(() => {
        recentScans.delete(studentId);
    }, 5000); 
};
