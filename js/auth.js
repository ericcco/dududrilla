/* ====================
   AUTHENTICATION MODULE
   Handles admin authentication
   
   This module uses Firebase Authentication for secure admin login.
   ==================== */

'use strict';

/**
 * Authentication Module
 * Manages admin authentication via Firebase
 */
window.AuthModule = (function() {

    // ==================== FIREBASE AUTHENTICATION ====================
    
    /**
     * Login with Firebase email/password
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {Promise<firebase.User>}
     */
    async function firebaseLogin(email, password) {
        const auth = window.FirebaseConfig.getAuth();
        
        if (!auth) {
            throw new Error('Firebase Authentication no está disponible.');
        }

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Firebase login error:', error);
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    throw new Error('Email o contraseña incorrectos.');
                case 'auth/invalid-email':
                    throw new Error('Email inválido.');
                case 'auth/too-many-requests':
                    throw new Error('Demasiados intentos. Por favor, espera antes de intentar de nuevo.');
                default:
                    throw new Error('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
            }
        }
    }

    /**
     * Logout from Firebase
     * @returns {Promise<void>}
     */
    async function firebaseLogout() {
        const auth = window.FirebaseConfig.getAuth();
        
        if (!auth) {
            return;
        }

        try {
            await auth.signOut();
        } catch (error) {
            console.error('Firebase logout error:', error);
        }
    }

    /**
     * Get current Firebase user
     * @returns {firebase.User|null}
     */
    function getCurrentUser() {
        const auth = window.FirebaseConfig.getAuth();
        return auth ? auth.currentUser : null;
    }

    /**
     * Check if authenticated with Firebase
     * @returns {boolean}
     */
    function isFirebaseAuthenticated() {
        return getCurrentUser() !== null;
    }

    /**
     * Set up auth state listener
     * @param {Function} callback - Function to call when auth state changes
     * @returns {Function} Unsubscribe function
     */
    function onAuthStateChanged(callback) {
        const auth = window.FirebaseConfig.getAuth();
        
        if (!auth) {
            return function() {};
        }

        return auth.onAuthStateChanged(callback);
    }

    // ==================== AUTH INTERFACE ====================

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    function isAuthenticated() {
        return isFirebaseAuthenticated();
    }

    /**
     * Logout from Firebase
     */
    async function logout() {
        await firebaseLogout();
    }

    // Public API
    return {
        // Firebase auth
        firebaseLogin: firebaseLogin,
        firebaseLogout: firebaseLogout,
        getCurrentUser: getCurrentUser,
        isFirebaseAuthenticated: isFirebaseAuthenticated,
        onAuthStateChanged: onAuthStateChanged,
        
        // Interface
        isAuthenticated: isAuthenticated,
        logout: logout
    };

})();
