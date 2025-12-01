/* ====================
   RSVP MODULE
   Handles RSVP form submission and storage in Firestore
   ==================== */

'use strict';

/**
 * RSVP Module
 * Manages RSVP form submission and data persistence
 */
window.RSVPModule = (function() {

    // Current validated invitation code data
    let currentInvitationCode = null;

    /**
     * Set the current validated invitation code
     * @param {Object} codeData - The validated code data
     */
    function setCurrentCode(codeData) {
        currentInvitationCode = codeData;
    }

    /**
     * Get the current validated invitation code
     * @returns {Object|null}
     */
    function getCurrentCode() {
        return currentInvitationCode;
    }

    /**
     * Clear the current invitation code
     */
    function clearCurrentCode() {
        currentInvitationCode = null;
    }

    /**
     * Check if an RSVP already exists for a given invitation code
     * @param {string} code - The invitation code to check
     * @returns {Promise<boolean>} - True if an RSVP exists for this code
     */
    async function checkExistingRSVP(code) {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        if (!code || typeof code !== 'string' || code.trim() === '') {
            return false;
        }

        const normalizedCode = code.trim().toUpperCase();

        try {
            const querySnapshot = await db.collection('rsvps')
                .where('code', '==', normalizedCode)
                .limit(1)
                .get();

            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking existing RSVP:', error);
            return false;
        }
    }

    /**
     * Submit RSVP to Firestore
     * @param {Object} formData - The form data to submit
     * @returns {Promise<Object>} - The created RSVP document
     */
    async function submitRSVP(formData) {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado. Por favor, contacta al administrador.');
        }

        if (!currentInvitationCode) {
            throw new Error('No hay un código de invitación válido. Por favor, introduce tu código primero.');
        }

        // Validate required fields
        if (!formData.name || formData.name.trim() === '') {
            throw new Error('Por favor, introduce tu nombre completo.');
        }

        if (!formData.email || formData.email.trim() === '') {
            throw new Error('Por favor, introduce tu email.');
        }

        if (!formData.attendance) {
            throw new Error('Por favor, indica si asistirás.');
        }

        // Re-check that no RSVP exists for this code before submission (prevent double submission)
        const existingRSVP = await checkExistingRSVP(currentInvitationCode.code);
        if (existingRSVP) {
            throw new Error('Ya has enviado tu confirmación anteriormente. No puedes enviar otra vez.');
        }

        // Calculate total guests (attendee + companions)
        const guestsCount = parseInt(formData.guestsCount, 10) || 1;
        
        // Check if guests count exceeds remaining capacity
        if (guestsCount > currentInvitationCode.remainingGuests) {
            throw new Error(`El número de invitados excede la capacidad permitida. Máximo permitido: ${currentInvitationCode.remainingGuests}`);
        }

        // Prepare RSVP document
        const rsvpData = {
            code: currentInvitationCode.code,
            codeId: currentInvitationCode.id,
            name: formData.name.trim(),
            guestsCount: guestsCount,
            email: formData.email.trim(),
            phone: formData.phone ? formData.phone.trim() : '',
            attendance: formData.attendance === 'si' ? 'Will attend' : 'Will not attend',
            allergies: formData.allergies ? formData.allergies.trim() : '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            // Use a batch write to ensure atomicity
            const batch = db.batch();

            // Create RSVP document
            const rsvpRef = db.collection('rsvps').doc();
            batch.set(rsvpRef, rsvpData);

            // Update used guests count only if attending
            if (formData.attendance === 'si') {
                const codeRef = db.collection('invitationCodes').doc(currentInvitationCode.id);
                batch.update(codeRef, {
                    usedGuests: firebase.firestore.FieldValue.increment(guestsCount)
                });
            }

            // Commit the batch
            await batch.commit();

            // Store submission status in sessionStorage
            sessionStorage.setItem('rsvpSubmitted', '1');

            // Clear the current invitation code after successful submission
            clearCurrentCode();

            return {
                id: rsvpRef.id,
                ...rsvpData,
                createdAt: new Date()
            };

        } catch (error) {
            console.error('Error submitting RSVP:', error);
            // Re-throw if it's our custom error
            if (error.message.includes('Ya has enviado')) {
                throw error;
            }
            throw new Error('Error al enviar tu confirmación. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Get all RSVPs (for admin use)
     * @returns {Promise<Array>}
     */
    async function getAllRSVPs() {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        try {
            const querySnapshot = await db.collection('rsvps')
                .orderBy('createdAt', 'desc')
                .get();

            const rsvps = [];
            querySnapshot.forEach(function(doc) {
                rsvps.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return rsvps;

        } catch (error) {
            console.error('Error getting RSVPs:', error);
            throw new Error('Error al obtener las confirmaciones.');
        }
    }

    /**
     * Delete an RSVP (for admin use)
     * @param {string} rsvpId - The RSVP document ID
     * @returns {Promise<boolean>}
     */
    async function deleteRSVP(rsvpId) {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        try {
            // Get the RSVP to check if we need to decrement the code count
            const rsvpDoc = await db.collection('rsvps').doc(rsvpId).get();
            
            if (!rsvpDoc.exists) {
                throw new Error('RSVP no encontrado.');
            }

            const rsvpData = rsvpDoc.data();

            // Use a batch to ensure atomicity
            const batch = db.batch();

            // Delete the RSVP
            batch.delete(db.collection('rsvps').doc(rsvpId));

            // If the RSVP was for someone who was attending, decrement the used guests
            if (rsvpData.attendance === 'Will attend' && rsvpData.codeId) {
                const codeRef = db.collection('invitationCodes').doc(rsvpData.codeId);
                batch.update(codeRef, {
                    usedGuests: firebase.firestore.FieldValue.increment(-rsvpData.guestsCount)
                });
            }

            await batch.commit();
            return true;

        } catch (error) {
            console.error('Error deleting RSVP:', error);
            throw new Error('Error al eliminar la confirmación.');
        }
    }

    // Public API
    return {
        setCurrentCode: setCurrentCode,
        getCurrentCode: getCurrentCode,
        clearCurrentCode: clearCurrentCode,
        checkExistingRSVP: checkExistingRSVP,
        submitRSVP: submitRSVP,
        getAllRSVPs: getAllRSVPs,
        deleteRSVP: deleteRSVP
    };

})();
