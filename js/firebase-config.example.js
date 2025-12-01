/* ====================
   FIREBASE CONFIGURATION - EXAMPLE FILE
   
   INSTRUCTIONS:
   1. Create a Firebase project at https://console.firebase.google.com/
   2. Enable Firestore Database in your project
   3. Enable Authentication (Email/Password) for admin access
   4. Copy your Firebase configuration from Project Settings > General > Your apps
   5. Create a new file called 'firebase-config.js' (not .example.js)
   6. Replace the placeholder values below with your actual Firebase config
   7. DO NOT commit firebase-config.js with real credentials to public repositories
   
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

// Firebase configuration - REPLACE THESE VALUES WITH YOUR OWN
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
