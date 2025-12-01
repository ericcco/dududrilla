/* ====================
   AUTHENTICATION MODULE
   Handles admin authentication
   
   NOTE: This module provides two authentication options:
   - Option A: Simple password (NOT secure for production, password stored in front-end)
   - Option B: Firebase Authentication (preferred, more secure)
   ==================== */

'use strict';

/**
 * Authentication Module
 * Manages admin authentication
 */
window.AuthModule = (function() {

    // ==================== OPTION A: SIMPLE PASSWORD ====================
    // WARNING: This is NOT secure for production use!
    // The password is stored in the front-end JavaScript and can be easily viewed.
    // Use this only for testing or if you accept the security risk.
    // For better security, use Option B (Firebase Authentication).
    
    const SIMPLE_PASSWORD = 'admin123'; // CHANGE THIS PASSWORD!
    const ADMIN_KEY = 'wedding_admin_authenticated';

    /**
     * Authenticate using simple password
     * WARNING: Not secure for production!
     * @param {string} password - The password to check
     * @returns {boolean}
     */
    function simplePasswordLogin(password) {
        if (password === SIMPLE_PASSWORD) {
            sessionStorage.setItem(ADMIN_KEY, 'true');
            return true;
        }
        return false;
    }

    /**
     * Check if authenticated with simple password
     * @returns {boolean}
     */
    function isSimpleAuthenticated() {
        return sessionStorage.getItem(ADMIN_KEY) === 'true';
    }

    /**
     * Logout from simple authentication
     */
    function simpleLogout() {
        sessionStorage.removeItem(ADMIN_KEY);
    }

    // ==================== OPTION B: FIREBASE AUTHENTICATION ====================
    // Preferred method - uses Firebase Authentication with email/password
    
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

    // ==================== COMBINED AUTH INTERFACE ====================

    /**
     * Check if user is authenticated (either method)
     * @returns {boolean}
     */
    function isAuthenticated() {
        return isSimpleAuthenticated() || isFirebaseAuthenticated();
    }

    /**
     * Logout from any authentication method
     */
    async function logout() {
        simpleLogout();
        await firebaseLogout();
    }

    // Public API
    return {
        // Simple password auth (not secure)
        simplePasswordLogin: simplePasswordLogin,
        isSimpleAuthenticated: isSimpleAuthenticated,
        simpleLogout: simpleLogout,
        
        // Firebase auth (preferred)
        firebaseLogin: firebaseLogin,
        firebaseLogout: firebaseLogout,
        getCurrentUser: getCurrentUser,
        isFirebaseAuthenticated: isFirebaseAuthenticated,
        onAuthStateChanged: onAuthStateChanged,
        
        // Combined interface
        isAuthenticated: isAuthenticated,
        logout: logout
    };

})();
