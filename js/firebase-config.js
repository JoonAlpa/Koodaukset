// Firebase configuration
firebase.initializeApp({
    apiKey: "AIzaSyC3PDx2-VNSZjZPBwfN6DudI7SOxoll7Fw",
    authDomain: "juoksuseuranta.firebaseapp.com",
    projectId: "juoksuseuranta",
    storageBucket: "juoksuseuranta.firebasestorage.app",
    messagingSenderId: "135052551216",
    appId: "1:135052551216:web:f4678f67b35c5c103f39f5",
    measurementId: "G-VKR8HWP831"
});

const db = firebase.firestore();

// Anonymous auth — returns promise that resolves with user
function firebaseAuth() {
    return firebase.auth().signInAnonymously()
        .then(function(cred) {
            console.log('Firebase: kirjauduttu anonyymisti, uid:', cred.user.uid);
            return cred.user;
        })
        .catch(function(err) {
            console.warn('Firebase auth epäonnistui, käytetään vain localStoragea:', err.message);
            return null;
        });
}
