/* ====================
   ADMIN DASHBOARD MODULE
   Handles admin panel functionality including:
   - Invitation code management
   - RSVP viewing
   - Statistics dashboard
   ==================== */

'use strict';

/**
 * Admin Dashboard Module
 * Manages all admin panel functionality
 */
window.AdminDashboard = (function() {

    // ==================== INVITATION CODES MANAGEMENT ====================

    /**
     * Generate a random invitation code
     * @param {number} length - Code length (default 8)
     * @returns {string}
     */
    function generateRandomCode(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    /**
     * Get all invitation codes
     * @returns {Promise<Array>}
     */
    async function getAllCodes() {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        try {
            const querySnapshot = await db.collection('invitationCodes').get();

            const codes = [];
            querySnapshot.forEach(function(doc) {
                codes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return codes;

        } catch (error) {
            console.error('Error getting invitation codes:', error);
            throw new Error('Error al obtener los códigos de invitación.');
        }
    }

    /**
     * Create a new invitation code
     * @param {Object} codeData - The code data
     * @returns {Promise<Object>}
     */
    async function createCode(codeData) {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        // Validate required fields
        if (!codeData.code || codeData.code.trim() === '') {
            throw new Error('El código es obligatorio.');
        }

        const normalizedCode = codeData.code.trim().toUpperCase();

        // Check if code already exists
        const existingQuery = await db.collection('invitationCodes')
            .where('code', '==', normalizedCode)
            .limit(1)
            .get();

        if (!existingQuery.empty) {
            throw new Error('Este código ya existe. Por favor, usa otro código.');
        }

        const newCode = {
            code: normalizedCode,
            assignedTo: codeData.assignedTo ? codeData.assignedTo.trim() : '',
            maxGuests: parseInt(codeData.maxGuests, 10) || 1,
            usedGuests: 0,
            isActive: codeData.isActive !== false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = await db.collection('invitationCodes').add(newCode);
            return {
                id: docRef.id,
                ...newCode,
                createdAt: new Date()
            };

        } catch (error) {
            console.error('Error creating invitation code:', error);
            throw new Error('Error al crear el código de invitación.');
        }
    }

    /**
     * Update an existing invitation code
     * @param {string} codeId - The code document ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<boolean>}
     */
    async function updateCode(codeId, updates) {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        const allowedFields = ['assignedTo', 'maxGuests', 'isActive'];
        const updateData = {};

        allowedFields.forEach(function(field) {
            if (updates[field] !== undefined) {
                if (field === 'maxGuests') {
                    updateData[field] = parseInt(updates[field], 10) || 1;
                } else if (field === 'assignedTo') {
                    updateData[field] = updates[field] ? updates[field].trim() : '';
                } else {
                    updateData[field] = updates[field];
                }
            }
        });

        if (Object.keys(updateData).length === 0) {
            throw new Error('No hay campos válidos para actualizar.');
        }

        updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        try {
            await db.collection('invitationCodes').doc(codeId).update(updateData);
            return true;

        } catch (error) {
            console.error('Error updating invitation code:', error);
            throw new Error('Error al actualizar el código de invitación.');
        }
    }

    /**
     * Delete an invitation code
     * @param {string} codeId - The code document ID
     * @returns {Promise<boolean>}
     */
    async function deleteCode(codeId) {
        const db = window.FirebaseConfig.getFirestore();

        if (!db) {
            throw new Error('Firebase no está inicializado.');
        }

        try {
            await db.collection('invitationCodes').doc(codeId).delete();
            return true;

        } catch (error) {
            console.error('Error deleting invitation code:', error);
            throw new Error('Error al eliminar el código de invitación.');
        }
    }

    /**
     * Toggle code active status
     * @param {string} codeId - The code document ID
     * @param {boolean} isActive - New active status
     * @returns {Promise<boolean>}
     */
    async function toggleCodeStatus(codeId, isActive) {
        return await updateCode(codeId, { isActive: isActive });
    }

    // ==================== STATISTICS ====================

    /**
     * Calculate dashboard statistics
     * @returns {Promise<Object>}
     */
    async function getStatistics() {
        try {
            const [codes, rsvps] = await Promise.all([
                getAllCodes(),
                window.RSVPModule.getAllRSVPs()
            ]);

            // Code statistics
            const totalCodes = codes.length;
            const activeCodes = codes.filter(function(c) { return c.isActive; }).length;
            const inactiveCodes = totalCodes - activeCodes;
            const totalMaxGuests = codes.reduce(function(sum, c) { return sum + (c.maxGuests || 0); }, 0);
            const totalUsedGuests = codes.reduce(function(sum, c) { return sum + (c.usedGuests || 0); }, 0);

            // RSVP statistics
            const totalRSVPs = rsvps.length;
            const confirmedAttending = rsvps.filter(function(r) { return r.attendance === 'Will attend'; });
            const notAttending = rsvps.filter(function(r) { return r.attendance === 'Will not attend'; });
            
            const totalConfirmedGuests = confirmedAttending.reduce(function(sum, r) { 
                return sum + (r.guestsCount || 1); 
            }, 0);
            
            const totalNotAttendingGuests = notAttending.reduce(function(sum, r) { 
                return sum + (r.guestsCount || 1); 
            }, 0);

            // Guests per code
            const guestsPerCode = {};
            rsvps.forEach(function(r) {
                if (r.attendance === 'Will attend') {
                    const code = r.code || 'Sin código';
                    guestsPerCode[code] = (guestsPerCode[code] || 0) + (r.guestsCount || 1);
                }
            });

            return {
                codes: {
                    total: totalCodes,
                    active: activeCodes,
                    inactive: inactiveCodes,
                    maxGuests: totalMaxGuests,
                    usedGuests: totalUsedGuests,
                    remainingCapacity: totalMaxGuests - totalUsedGuests
                },
                rsvps: {
                    total: totalRSVPs,
                    attending: confirmedAttending.length,
                    notAttending: notAttending.length,
                    totalConfirmedGuests: totalConfirmedGuests,
                    totalNotAttendingGuests: totalNotAttendingGuests
                },
                guestsPerCode: guestsPerCode
            };

        } catch (error) {
            console.error('Error calculating statistics:', error);
            throw new Error('Error al calcular las estadísticas.');
        }
    }

    // ==================== UI HELPERS ====================

    /**
     * Format date for display
     * @param {Date|firebase.firestore.Timestamp} date
     * @returns {string}
     */
    function formatDate(date) {
        if (!date) return '-';
        
        const d = date.toDate ? date.toDate() : new Date(date);
        
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Create HTML for the statistics dashboard
     * @param {Object} stats - Statistics object
     * @returns {string} HTML string
     */
    function renderStatsDashboard(stats) {
        return `
            <div class="stats-grid">
                <div class="stat-card stat-card--primary">
                    <span class="stat-card__icon">👥</span>
                    <div class="stat-card__content">
                        <span class="stat-card__value">${stats.rsvps.totalConfirmedGuests}</span>
                        <span class="stat-card__label">Invitados confirmados</span>
                    </div>
                </div>
                
                <div class="stat-card stat-card--secondary">
                    <span class="stat-card__icon">❌</span>
                    <div class="stat-card__content">
                        <span class="stat-card__value">${stats.rsvps.totalNotAttendingGuests}</span>
                        <span class="stat-card__label">No asistirán</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <span class="stat-card__icon">📨</span>
                    <div class="stat-card__content">
                        <span class="stat-card__value">${stats.rsvps.total}</span>
                        <span class="stat-card__label">Total respuestas</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <span class="stat-card__icon">🎫</span>
                    <div class="stat-card__content">
                        <span class="stat-card__value">${stats.codes.active} / ${stats.codes.total}</span>
                        <span class="stat-card__label">Códigos activos</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <span class="stat-card__icon">💺</span>
                    <div class="stat-card__content">
                        <span class="stat-card__value">${stats.codes.remainingCapacity}</span>
                        <span class="stat-card__label">Plazas disponibles</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <span class="stat-card__icon">📊</span>
                    <div class="stat-card__content">
                        <span class="stat-card__value">${stats.codes.usedGuests} / ${stats.codes.maxGuests}</span>
                        <span class="stat-card__label">Capacidad usada</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create HTML for the RSVP table
     * @param {Array} rsvps - Array of RSVPs
     * @returns {string} HTML string
     */
    function renderRSVPTable(rsvps) {
        if (rsvps.length === 0) {
            return '<p class="admin__empty">No hay confirmaciones todavía.</p>';
        }

        let html = `
            <div class="admin__table-wrapper">
                <table class="admin__table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Código</th>
                            <th>Invitados</th>
                            <th>Asistencia</th>
                            <th>Alergias</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        rsvps.forEach(function(rsvp) {
            const attendanceClass = rsvp.attendance === 'Will attend' ? 'attendance--yes' : 'attendance--no';
            const attendanceText = rsvp.attendance === 'Will attend' ? 'Asistirá' : 'No asistirá';
            
            html += `
                <tr data-rsvp-id="${rsvp.id}">
                    <td>${escapeHtml(rsvp.name)}</td>
                    <td>${escapeHtml(rsvp.email)}</td>
                    <td>${escapeHtml(rsvp.phone || '-')}</td>
                    <td><code>${escapeHtml(rsvp.code)}</code></td>
                    <td>${rsvp.guestsCount}</td>
                    <td><span class="attendance ${attendanceClass}">${attendanceText}</span></td>
                    <td>${escapeHtml(rsvp.allergies || '-')}</td>
                    <td>${formatDate(rsvp.createdAt)}</td>
                    <td>
                        <button class="btn btn--small btn--danger" onclick="AdminDashboard.confirmDeleteRSVP('${rsvp.id}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    }

    /**
     * Create HTML for the invitation codes table
     * @param {Array} codes - Array of codes
     * @returns {string} HTML string
     */
    function renderCodesTable(codes) {
        if (codes.length === 0) {
            return '<p class="admin__empty">No hay códigos de invitación todavía.</p>';
        }

        let html = `
            <div class="admin__table-wrapper">
                <table class="admin__table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Asignado a</th>
                            <th>Invitados</th>
                            <th>Usados</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        codes.forEach(function(code) {
            const statusClass = code.isActive ? 'status--active' : 'status--inactive';
            const statusText = code.isActive ? 'Activo' : 'Inactivo';
            
            html += `
                <tr data-code-id="${code.id}">
                    <td><code>${escapeHtml(code.code)}</code></td>
                    <td>${escapeHtml(code.assignedTo || '-')}</td>
                    <td>${code.maxGuests}</td>
                    <td>${code.usedGuests || 0}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td class="admin__actions">
                        <button class="btn btn--small btn--outline" onclick="AdminDashboard.showEditCodeModal('${code.id}')">
                            Editar
                        </button>
                        <button class="btn btn--small ${code.isActive ? 'btn--warning' : 'btn--success'}" 
                                onclick="AdminDashboard.toggleCode('${code.id}', ${!code.isActive})">
                            ${code.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button class="btn btn--small btn--danger" onclick="AdminDashboard.confirmDeleteCode('${code.id}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    }

    /**
     * Create HTML for guests per code chart (simple bar chart)
     * @param {Object} guestsPerCode - Object with code: count pairs
     * @returns {string} HTML string
     */
    function renderGuestsPerCodeChart(guestsPerCode) {
        const codes = Object.keys(guestsPerCode);
        
        if (codes.length === 0) {
            return '<p class="admin__empty">No hay datos de invitados por código.</p>';
        }

        const maxGuests = Math.max(...Object.values(guestsPerCode));
        
        let html = '<div class="chart">';
        
        codes.forEach(function(code) {
            const count = guestsPerCode[code];
            const percentage = maxGuests > 0 ? (count / maxGuests) * 100 : 0;
            
            html += `
                <div class="chart__bar-container">
                    <span class="chart__label">${escapeHtml(code)}</span>
                    <div class="chart__bar-wrapper">
                        <div class="chart__bar" style="width: ${percentage}%"></div>
                        <span class="chart__value">${count}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==================== USER INTERACTION ====================

    /**
     * Confirm and delete an RSVP
     * @param {string} rsvpId
     */
    async function confirmDeleteRSVP(rsvpId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta confirmación?')) {
            return;
        }

        try {
            await window.RSVPModule.deleteRSVP(rsvpId);
            showNotification('Confirmación eliminada correctamente.', 'success');
            await refreshRSVPsTable();
            await refreshStats();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    /**
     * Confirm and delete an invitation code
     * @param {string} codeId
     */
    async function confirmDeleteCode(codeId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este código de invitación?')) {
            return;
        }

        try {
            await deleteCode(codeId);
            showNotification('Código eliminado correctamente.', 'success');
            await refreshCodesTable();
            await refreshStats();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    /**
     * Toggle a code's active status
     * @param {string} codeId
     * @param {boolean} newStatus
     */
    async function toggleCode(codeId, newStatus) {
        try {
            await toggleCodeStatus(codeId, newStatus);
            const statusText = newStatus ? 'activado' : 'desactivado';
            showNotification(`Código ${statusText} correctamente.`, 'success');
            await refreshCodesTable();
            await refreshStats();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    /**
     * Show notification
     * @param {string} message
     * @param {string} type - 'success', 'error', 'info'
     */
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(function() {
            notification.remove();
        }, 3000);
    }

    // ==================== REFRESH FUNCTIONS ====================

    /**
     * Refresh the RSVPs table
     */
    async function refreshRSVPsTable() {
        const container = document.getElementById('rsvpsContainer');
        if (!container) return;

        try {
            container.innerHTML = '<p class="admin__loading">Cargando...</p>';
            const rsvps = await window.RSVPModule.getAllRSVPs();
            container.innerHTML = renderRSVPTable(rsvps);
        } catch (error) {
            container.innerHTML = `<p class="admin__error">${escapeHtml(error.message)}</p>`;
        }
    }

    /**
     * Refresh the codes table
     */
    async function refreshCodesTable() {
        const container = document.getElementById('codesContainer');
        if (!container) return;

        try {
            container.innerHTML = '<p class="admin__loading">Cargando...</p>';
            const codes = await getAllCodes();
            container.innerHTML = renderCodesTable(codes);
        } catch (error) {
            container.innerHTML = `<p class="admin__error">${escapeHtml(error.message)}</p>`;
        }
    }

    /**
     * Refresh statistics
     */
    async function refreshStats() {
        const statsContainer = document.getElementById('statsContainer');
        const chartContainer = document.getElementById('chartContainer');
        
        try {
            if (statsContainer) {
                statsContainer.innerHTML = '<p class="admin__loading">Cargando estadísticas...</p>';
            }
            
            const stats = await getStatistics();
            
            if (statsContainer) {
                statsContainer.innerHTML = renderStatsDashboard(stats);
            }
            
            if (chartContainer) {
                chartContainer.innerHTML = '<h3 class="admin__subtitle">Invitados por código</h3>' + 
                    renderGuestsPerCodeChart(stats.guestsPerCode);
            }
        } catch (error) {
            if (statsContainer) {
                statsContainer.innerHTML = `<p class="admin__error">${escapeHtml(error.message)}</p>`;
            }
        }
    }

    /**
     * Refresh all admin data
     */
    async function refreshAll() {
        await Promise.all([
            refreshStats(),
            refreshRSVPsTable(),
            refreshCodesTable()
        ]);
    }

    // ==================== CODE MODALS ====================

    // Store codes data for editing
    let codesCache = [];

    /**
     * Show the create code modal
     */
    function showCreateCodeModal() {
        const modal = document.getElementById('codeModal');
        const form = document.getElementById('codeForm');
        const title = document.getElementById('codeModalTitle');
        const codeInput = document.getElementById('codeInput');
        
        if (!modal || !form || !title || !codeInput) return;

        title.textContent = 'Crear nuevo código';
        form.reset();
        codeInput.value = generateRandomCode();
        codeInput.readOnly = false;
        form.dataset.mode = 'create';
        form.dataset.codeId = '';
        
        modal.classList.add('active');
    }

    /**
     * Show the edit code modal
     * @param {string} codeId
     */
    async function showEditCodeModal(codeId) {
        const modal = document.getElementById('codeModal');
        const form = document.getElementById('codeForm');
        const title = document.getElementById('codeModalTitle');
        const codeInput = document.getElementById('codeInput');
        const assignedToInput = document.getElementById('assignedToInput');
        const maxGuestsInput = document.getElementById('maxGuestsInput');
        const isActiveInput = document.getElementById('isActiveInput');
        
        if (!modal || !form || !title || !codeInput) return;

        // Get code data
        const code = await window.InvitationCodes.getCodeById(codeId);
        
        if (!code) {
            showNotification('Código no encontrado.', 'error');
            return;
        }

        title.textContent = 'Editar código';
        codeInput.value = code.code;
        codeInput.readOnly = true;
        assignedToInput.value = code.assignedTo || '';
        maxGuestsInput.value = code.maxGuests || 1;
        isActiveInput.checked = code.isActive;
        form.dataset.mode = 'edit';
        form.dataset.codeId = codeId;
        
        modal.classList.add('active');
    }

    /**
     * Hide the code modal
     */
    function hideCodeModal() {
        const modal = document.getElementById('codeModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Handle code form submission
     * @param {Event} e
     */
    async function handleCodeFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mode = form.dataset.mode;
        const codeId = form.dataset.codeId;
        
        const codeData = {
            code: document.getElementById('codeInput').value,
            assignedTo: document.getElementById('assignedToInput').value,
            maxGuests: document.getElementById('maxGuestsInput').value,
            isActive: document.getElementById('isActiveInput').checked
        };

        try {
            if (mode === 'create') {
                await createCode(codeData);
                showNotification('Código creado correctamente.', 'success');
            } else {
                await updateCode(codeId, codeData);
                showNotification('Código actualizado correctamente.', 'success');
            }
            
            hideCodeModal();
            await refreshCodesTable();
            await refreshStats();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    /**
     * Generate a new random code in the form
     */
    function generateNewCode() {
        const codeInput = document.getElementById('codeInput');
        if (codeInput && !codeInput.readOnly) {
            codeInput.value = generateRandomCode();
        }
    }

    // Public API
    return {
        // Code management
        getAllCodes: getAllCodes,
        createCode: createCode,
        updateCode: updateCode,
        deleteCode: deleteCode,
        toggleCodeStatus: toggleCodeStatus,
        generateRandomCode: generateRandomCode,
        
        // Statistics
        getStatistics: getStatistics,
        
        // UI rendering
        formatDate: formatDate,
        renderStatsDashboard: renderStatsDashboard,
        renderRSVPTable: renderRSVPTable,
        renderCodesTable: renderCodesTable,
        renderGuestsPerCodeChart: renderGuestsPerCodeChart,
        
        // User actions
        confirmDeleteRSVP: confirmDeleteRSVP,
        confirmDeleteCode: confirmDeleteCode,
        toggleCode: toggleCode,
        showNotification: showNotification,
        
        // Refresh functions
        refreshRSVPsTable: refreshRSVPsTable,
        refreshCodesTable: refreshCodesTable,
        refreshStats: refreshStats,
        refreshAll: refreshAll,
        
        // Modal functions
        showCreateCodeModal: showCreateCodeModal,
        showEditCodeModal: showEditCodeModal,
        hideCodeModal: hideCodeModal,
        handleCodeFormSubmit: handleCodeFormSubmit,
        generateNewCode: generateNewCode
    };

})();
