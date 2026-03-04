// --- LocalStorage (offline-first) ---
function getRuns() {
    return JSON.parse(localStorage.getItem('runs') || '[]');
}

function saveRuns(runs) {
    localStorage.setItem('runs', JSON.stringify(runs));
}

// --- Firestore sync ---
var _firestoreUser = null;

function _runsCollection() {
    if (!_firestoreUser) return null;
    return db.collection('users').doc(_firestoreUser.uid).collection('runs');
}

function syncToFirestore(runs) {
    var col = _runsCollection();
    if (!col) return;

    // Write all runs as a single document for simplicity
    db.collection('users').doc(_firestoreUser.uid).set({
        runs: runs,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(err) {
        console.warn('Firestore-tallennus epäonnistui:', err.message);
    });
}

function syncFromFirestore() {
    if (!_firestoreUser) return Promise.resolve(null);

    return db.collection('users').doc(_firestoreUser.uid).get()
        .then(function(doc) {
            if (doc.exists && doc.data().runs) {
                return doc.data().runs;
            }
            return null;
        })
        .catch(function(err) {
            console.warn('Firestore-luku epäonnistui:', err.message);
            return null;
        });
}

// Merge: combine local and cloud runs, deduplicate by id
function mergeRuns(localRuns, cloudRuns) {
    if (!cloudRuns) return localRuns;
    var byId = {};
    localRuns.forEach(function(r) { byId[r.id] = r; });
    cloudRuns.forEach(function(r) { byId[r.id] = r; });
    return Object.values(byId).sort(function(a, b) {
        return b.date.localeCompare(a.date);
    });
}

// Save to both localStorage and Firestore
function saveRunsSync(runs) {
    saveRuns(runs);
    syncToFirestore(runs);
}

// Listen for real-time changes from Firestore
function listenFirestore(onUpdate) {
    if (!_firestoreUser) return;

    db.collection('users').doc(_firestoreUser.uid).onSnapshot(function(doc) {
        if (doc.exists && doc.data().runs) {
            var cloudRuns = doc.data().runs;
            var localRuns = getRuns();
            var merged = mergeRuns(localRuns, cloudRuns);
            saveRuns(merged); // update localStorage
            if (onUpdate) onUpdate(merged);
        }
    }, function(err) {
        console.warn('Firestore-kuuntelu epäonnistui:', err.message);
    });
}

// Initialize: auth + initial sync
function initStorage() {
    return firebaseAuth().then(function(user) {
        _firestoreUser = user;
        if (!user) return getRuns();

        return syncFromFirestore().then(function(cloudRuns) {
            var localRuns = getRuns();
            var merged = mergeRuns(localRuns, cloudRuns);
            saveRuns(merged);
            syncToFirestore(merged);
            return merged;
        });
    }).catch(function() {
        return getRuns();
    });
}
