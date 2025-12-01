/* ====================
   FIREBASE CONFIGURATION
   
   This file contains the Firebase configuration for the dududrilla wedding website.
   
   FIRESTORE STRUCTURE:
   - Collection: invitationCodes
     - code (string, unique)
     - assignedTo (string)
     - maxGuests (number)
     - usedGuests (number)
     - isActive (boolean)
   
   - Collection: rsvps
     - code (string)
     - name (string)
     - guestsCount (number)
     - email (string)
     - phone (string, optional)
     - attendance (string: "Will attend" / "Will not attend")
     - allergies (string)
     - createdAt (timestamp)
   ==================== */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCtMQUpkbAyTuTwn3FRK68zAWjMwehX4I",
    authDomain: "dududrilla.firebaseapp.com",
    projectId: "dududrilla",
    storageBucket: "dududrilla.firebasestorage.app",
    messagingSenderId: "221057179546",
    appId: "1:221057179546:web:fdf07a058a2c9e62c86423",
    measurementId: "G-RSMW42VCCN"
};

// Initialize Firebase
let app;
let db;
let auth;

/**
 * Initialize Firebase services
 * Call this function after Firebase SDK is loaded
 */
function initializeFirebase() {
    try {
        // Check if Firebase SDK is available
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded. Make sure to include Firebase scripts.');
            return false;
        }

        // Initialize Firebase app if not already initialized
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }

        // Initialize Firestore
        db = firebase.firestore();

        // Initialize Authentication
        auth = firebase.auth();

        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

/**
 * Get Firestore database instance
 * @returns {firebase.firestore.Firestore|null}
 */
function getFirestore() {
    return db;
}

/**
 * Get Firebase Auth instance
 * @returns {firebase.auth.Auth|null}
 */
function getAuth() {
    return auth;
}

// Export functions for use in other modules
window.FirebaseConfig = {
    initialize: initializeFirebase,
    getFirestore: getFirestore,
    getAuth: getAuth,
    config: firebaseConfig
};
