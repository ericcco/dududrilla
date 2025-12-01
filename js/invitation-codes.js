/* ====================
   INVITATION CODES MODULE
   Handles validation of invitation codes against Firestore
   ==================== */

'use strict';

/**
 * Invitation Codes Module
 * Manages invitation code validation and retrieval
 */
window.InvitationCodes = (function() {
    
    /**
     * Fetch and validate basic code data from Firestore
     * @param {string} code - The invitation code to validate
     * @returns {Promise<Object>} - Returns code data if valid, throws error if invalid
     */
    async function fetchCodeData(code) {
        const db = window.FirebaseConfig.getFirestore();
        
        if (!db) {
            throw new Error('Firebase no está inicializado. Por favor, contacta al administrador.');
        }

        if (!code || typeof code !== 'string' || code.trim() === '') {
            throw new Error('Por favor, introduce un código de invitación válido.');
        }

        const normalizedCode = code.trim().toUpperCase();

        try {
            // Query for the invitation code
            const querySnapshot = await db.collection('invitationCodes')
                .where('code', '==', normalizedCode)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                throw new Error('El código de invitación no es válido.');
            }

            const doc = querySnapshot.docs[0];
            const codeData = doc.data();

            // Check if code is active
            if (!codeData.isActive) {
                throw new Error('Este código de invitación ya no está activo.');
            }

            const usedGuests = codeData.usedGuests || 0;
            const maxGuests = codeData.maxGuests || 1;

            return {
                id: doc.id,
                code: codeData.code,
                assignedTo: codeData.assignedTo,
                maxGuests: maxGuests,
                usedGuests: usedGuests,
                remainingGuests: Math.max(0, maxGuests - usedGuests),
                isActive: codeData.isActive
            };

        } catch (error) {
            if (error.message.includes('código')) {
                throw error; // Re-throw our custom errors
            }
            console.error('Error validating invitation code:', error);
            throw new Error('Error al validar el código. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Validate an invitation code (checks remaining guests)
     * @param {string} code - The invitation code to validate
     * @returns {Promise<Object>} - Returns code data if valid, throws error if invalid
     */
    async function validateCode(code) {
        const codeData = await fetchCodeData(code);
        
        // Check if max guests has been reached
        if (codeData.remainingGuests <= 0) {
            throw new Error('Este código de invitación ya ha alcanzado el máximo de invitados permitidos.');
        }

        return codeData;
    }

    /**
     * Validate an invitation code for access gate (doesn't check remaining guests)
     * This allows users to access the website even if their code has reached max guests
     * @param {string} code - The invitation code to validate
     * @returns {Promise<Object>} - Returns code data if valid, throws error if invalid
     */
    async function validateCodeForAccess(code) {
        return await fetchCodeData(code);
    }

    /**
     * Get invitation code by ID
     * @param {string} codeId - The Firestore document ID
     * @returns {Promise<Object|null>}
     */
    async function getCodeById(codeId) {
        const db = window.FirebaseConfig.getFirestore();
        
        if (!db) {
            return null;
        }

        try {
            const doc = await db.collection('invitationCodes').doc(codeId).get();
            
            if (!doc.exists) {
                return null;
            }

            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('Error getting invitation code:', error);
            return null;
        }
    }

    /**
     * Increment used guests count for a code
     * @param {string} codeId - The Firestore document ID
     * @param {number} guestsToAdd - Number of guests to add
     * @returns {Promise<boolean>}
     */
    async function incrementUsedGuests(codeId, guestsToAdd = 1) {
        const db = window.FirebaseConfig.getFirestore();
        
        if (!db) {
            return false;
        }

        try {
            await db.collection('invitationCodes').doc(codeId).update({
                usedGuests: firebase.firestore.FieldValue.increment(guestsToAdd)
            });
            return true;
        } catch (error) {
            console.error('Error incrementing used guests:', error);
            return false;
        }
    }

    // Public API
    return {
        validateCode: validateCode,
        validateCodeForAccess: validateCodeForAccess,
        getCodeById: getCodeById,
        incrementUsedGuests: incrementUsedGuests
    };

})();
