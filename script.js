/* ====================
   WEDDING WEBSITE - Sandra & Eduard
   JavaScript - Navegación y validación del formulario
   ==================== */

'use strict';

// ==================== NAVEGACIÓN MÓVIL ====================

/**
 * Inicializa el menú de navegación móvil
 */
function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navList = document.querySelector('.nav__list');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!navToggle || !navList) return;

    // Toggle del menú
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navList.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navList.classList.remove('active');
        });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navList.contains(event.target);
        if (!isClickInsideNav && navList.classList.contains('active')) {
            navToggle.classList.remove('active');
            navList.classList.remove('active');
        }
    });
}

// ==================== SCROLL SUAVE ====================

/**
 * Inicializa el scroll suave para los enlaces internos
 * Nota: HTML tiene scroll-behavior: smooth, pero esto añade offset para el header fijo
 */
function initSmoothScroll() {
    const headerHeight = 70; // Altura aproximada del header

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== VALIDACIÓN DEL FORMULARIO ====================

/**
 * Valida un campo de email
 * @param {string} email - El email a validar
 * @returns {boolean} - True si es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Muestra un mensaje de error en un campo
 * @param {HTMLElement} input - El campo de entrada
 * @param {string} message - El mensaje de error
 */
function showError(input, message) {
    const errorSpan = document.getElementById(input.id + 'Error');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
    input.classList.add('error');
}

/**
 * Limpia el mensaje de error de un campo
 * @param {HTMLElement} input - El campo de entrada
 */
function clearError(input) {
    const errorSpan = document.getElementById(input.id + 'Error');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
    input.classList.remove('error');
}

/**
 * Valida el formulario RSVP
 * @returns {boolean} - True si el formulario es válido
 */
function validateForm() {
    let isValid = true;

    // Validar nombre
    const nombreInput = document.getElementById('nombre');
    if (!nombreInput.value.trim()) {
        showError(nombreInput, 'Por favor, introduce tu nombre completo.');
        isValid = false;
    } else {
        clearError(nombreInput);
    }

    // Validar email
    const emailInput = document.getElementById('email');
    if (!emailInput.value.trim()) {
        showError(emailInput, 'Por favor, introduce tu email.');
        isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        showError(emailInput, 'Por favor, introduce un email válido.');
        isValid = false;
    } else {
        clearError(emailInput);
    }

    // Validar asistencia
    const asistenciaInputs = document.querySelectorAll('input[name="asistencia"]');
    const asistenciaChecked = Array.from(asistenciaInputs).some(function(input) {
        return input.checked;
    });
    
    const asistenciaError = document.getElementById('asistenciaError');
    if (!asistenciaChecked) {
        if (asistenciaError) {
            asistenciaError.textContent = 'Por favor, indica si asistirás.';
        }
        isValid = false;
    } else {
        if (asistenciaError) {
            asistenciaError.textContent = '';
        }
    }

    return isValid;
}

// ==================== INVITATION CODE VERIFICATION ====================

/**
 * Inicializa el sistema de verificación de códigos de invitación
 */
function initInvitationCodeVerification() {
    const codeForm = document.getElementById('codeVerificationForm');
    const invitationCodeForm = document.getElementById('invitationCodeForm');
    const invitationCodeInfo = document.getElementById('invitationCodeInfo');
    const rsvpForm = document.getElementById('rsvpForm');
    const changeCodeBtn = document.getElementById('changeCodeBtn');
    const codeInput = document.getElementById('invitationCode');
    const codeError = document.getElementById('invitationCodeError');

    if (!codeForm) return;

    // Check if RSVP was already submitted (skip showing the form)
    if (hasSubmittedRSVP()) {
        showAlreadySubmittedMessage();
        return;
    }

    // Check if code is already validated from access gate
    const storedCode = getStoredAccessCode();
    if (storedCode && window.RSVPModule.getCurrentCode()) {
        // Directly show the RSVP form with the stored code
        showValidatedCode(storedCode);
    }

    // Handle code verification form submission
    codeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = codeInput.value.trim();
        
        if (!code) {
            if (codeError) {
                codeError.textContent = 'Por favor, introduce tu código de invitación.';
            }
            codeInput.classList.add('error');
            return;
        }

        // Clear previous error
        if (codeError) {
            codeError.textContent = '';
        }
        codeInput.classList.remove('error');

        // Show loading state
        const submitBtn = codeForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Verificando...';
        submitBtn.disabled = true;

        try {
            // Validate the code using the InvitationCodes module
            const codeData = await window.InvitationCodes.validateCode(code);
            
            // Check if RSVP already exists for this code
            const rsvpExists = await checkAndHandleExistingRSVP(codeData.code);
            if (rsvpExists) {
                // Store the code anyway for reference
                storeAccessCode(codeData);
                return; // Already submitted message is shown by checkAndHandleExistingRSVP
            }
            
            // Store the validated code in the RSVP module
            window.RSVPModule.setCurrentCode(codeData);
            
            // Also store in session storage for access gate
            storeAccessCode(codeData);
            
            // Update UI to show validated code info
            showValidatedCode(codeData);
            
        } catch (error) {
            if (codeError) {
                codeError.textContent = error.message;
            }
            codeInput.classList.add('error');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Handle change code button
    if (changeCodeBtn) {
        changeCodeBtn.addEventListener('click', function() {
            // Clear the validated code
            window.RSVPModule.clearCurrentCode();
            
            // Also clear from session storage (requires re-verifying at access gate)
            sessionStorage.removeItem(ACCESS_CODE_KEY);
            
            // Reset UI
            invitationCodeForm.hidden = false;
            invitationCodeInfo.hidden = true;
            rsvpForm.hidden = true;
            codeInput.value = '';
            
            // Reset guests input
            const guestsInput = document.getElementById('acompanantes');
            if (guestsInput) {
                guestsInput.max = 10;
                guestsInput.value = 1;
            }
        });
    }

    // Real-time validation for code input
    if (codeInput) {
        codeInput.addEventListener('input', function() {
            // Convert to uppercase as user types
            this.value = this.value.toUpperCase();
            
            if (this.value.trim()) {
                clearError(this);
            }
        });
    }
}

/**
 * Show the validated code information and RSVP form
 * @param {Object} codeData - The validated code data
 */
function showValidatedCode(codeData) {
    const invitationCodeForm = document.getElementById('invitationCodeForm');
    const invitationCodeInfo = document.getElementById('invitationCodeInfo');
    const rsvpForm = document.getElementById('rsvpForm');
    const validatedCodeText = document.getElementById('validatedCodeText');
    const guestsRemainingText = document.getElementById('guestsRemainingText');
    const guestsInput = document.getElementById('acompanantes');
    const guestsHint = document.getElementById('guestsHint');

    // Check if the code has been fully redeemed (no remaining guests)
    if (codeData.remainingGuests <= 0) {
        showAlreadySubmittedMessage();
        return;
    }

    // Hide code form, show info and RSVP form
    invitationCodeForm.hidden = true;
    invitationCodeInfo.hidden = false;
    rsvpForm.hidden = false;

    // Update validated code display
    if (validatedCodeText) {
        validatedCodeText.textContent = codeData.code;
    }
    
    if (guestsRemainingText) {
        guestsRemainingText.textContent = ` (${codeData.remainingGuests} invitados restantes)`;
    }

    // Update guests input max value
    if (guestsInput) {
        guestsInput.max = codeData.remainingGuests;
        guestsInput.value = Math.min(1, codeData.remainingGuests);
    }

    // Update guests hint
    if (guestsHint) {
        guestsHint.textContent = `Máximo ${codeData.remainingGuests} invitados permitidos con este código`;
    }

    // Scroll to the RSVP form
    rsvpForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== RSVP FORM ====================

/**
 * Inicializa el formulario RSVP
 */
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('rsvpConfirmation');
    const rsvpButtons = document.getElementById('rsvpButtons');
    const invitationCodeInfo = document.getElementById('invitationCodeInfo');

    if (!form) return;

    // Validación en tiempo real para los campos obligatorios
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');

    if (nombreInput) {
        nombreInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showError(this, 'Por favor, introduce tu nombre completo.');
            } else {
                clearError(this);
            }
        });

        nombreInput.addEventListener('input', function() {
            if (this.value.trim()) {
                clearError(this);
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showError(this, 'Por favor, introduce tu email.');
            } else if (!isValidEmail(this.value.trim())) {
                showError(this, 'Por favor, introduce un email válido.');
            } else {
                clearError(this);
            }
        });

        emailInput.addEventListener('input', function() {
            if (this.value.trim() && isValidEmail(this.value.trim())) {
                clearError(this);
            }
        });
    }

    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Collect form data
        const formData = {
            name: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('telefono').value.trim(),
            guestsCount: parseInt(document.getElementById('acompanantes').value, 10) || 1,
            attendance: document.querySelector('input[name="asistencia"]:checked').value,
            allergies: document.getElementById('alergias').value.trim()
        };

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            // Submit RSVP using the module
            await window.RSVPModule.submitRSVP(formData);

            // Show success message
            form.hidden = true;
            if (rsvpButtons) {
                rsvpButtons.hidden = true;
            }
            if (invitationCodeInfo) {
                invitationCodeInfo.hidden = true;
            }
            if (confirmation) {
                confirmation.hidden = false;
            }

            // Scroll to confirmation message
            if (confirmation) {
                confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

        } catch (error) {
            // Show error message
            alert(error.message || 'Error al enviar tu confirmación. Por favor, inténtalo de nuevo.');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// ==================== HEADER SCROLL ====================

/**
 * Añade/quita clase al header cuando se hace scroll
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    
    if (!header) return;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Añadir sombra más pronunciada al hacer scroll
        if (scrollTop > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        }
    });
}

// ==================== HIGHLIGHT NAVEGACIÓN ACTIVA ====================

/**
 * Resalta el enlace de navegación correspondiente a la sección visible
 */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav__link');
    
    if (sections.length === 0 || navLinks.length === 0) return;

    function highlightNav() {
        let scrollPosition = window.scrollY + 100; // Offset para el header

        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    highlightNav(); // Ejecutar al cargar
}

// ==================== FIREBASE INITIALIZATION ====================

/**
 * Initialize Firebase when the page loads
 */
function initFirebase() {
    if (window.FirebaseConfig && typeof window.FirebaseConfig.initialize === 'function') {
        window.FirebaseConfig.initialize();
    }
}

// ==================== ACCESS GATE ====================

const ACCESS_CODE_KEY = 'wedding_access_code';
const RSVP_SUBMITTED_KEY = 'rsvpSubmitted';

/**
 * Check if user has already verified access code
 * @returns {boolean}
 */
function hasAccessCode() {
    return sessionStorage.getItem(ACCESS_CODE_KEY) !== null;
}

/**
 * Check if user has already submitted RSVP (from sessionStorage)
 * @returns {boolean}
 */
function hasSubmittedRSVP() {
    return sessionStorage.getItem(RSVP_SUBMITTED_KEY) === '1';
}

/**
 * Store the validated access code in session storage
 * @param {Object} codeData - The validated code data
 */
function storeAccessCode(codeData) {
    sessionStorage.setItem(ACCESS_CODE_KEY, JSON.stringify(codeData));
}

/**
 * Get the stored access code data
 * @returns {Object|null}
 */
function getStoredAccessCode() {
    const stored = sessionStorage.getItem(ACCESS_CODE_KEY);
    return stored ? JSON.parse(stored) : null;
}

/**
 * Show the "already submitted" message and hide the RSVP form
 */
function showAlreadySubmittedMessage() {
    const invitationCodeForm = document.getElementById('invitationCodeForm');
    const invitationCodeInfo = document.getElementById('invitationCodeInfo');
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpConfirmation = document.getElementById('rsvpConfirmation');
    const rsvpAlreadySubmitted = document.getElementById('rsvpAlreadySubmitted');
    const rsvpButtons = document.getElementById('rsvpButtons');

    // Hide all form elements
    if (invitationCodeForm) {
        invitationCodeForm.hidden = true;
    }
    if (invitationCodeInfo) {
        invitationCodeInfo.hidden = true;
    }
    if (rsvpForm) {
        rsvpForm.hidden = true;
    }
    if (rsvpConfirmation) {
        rsvpConfirmation.hidden = true;
    }
    if (rsvpButtons) {
        rsvpButtons.hidden = true;
    }

    // Show the already submitted message
    if (rsvpAlreadySubmitted) {
        rsvpAlreadySubmitted.hidden = false;
    }
}

/**
 * Check if RSVP exists in Firestore for the given code and update UI accordingly
 * @param {string} code - The invitation code to check
 * @returns {Promise<boolean>} - True if RSVP already exists
 */
async function checkAndHandleExistingRSVP(code) {
    if (!window.RSVPModule || typeof window.RSVPModule.checkExistingRSVP !== 'function') {
        return false;
    }

    try {
        const exists = await window.RSVPModule.checkExistingRSVP(code);
        if (exists) {
            // Store in sessionStorage so we don't need to check again
            sessionStorage.setItem(RSVP_SUBMITTED_KEY, '1');
            showAlreadySubmittedMessage();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking existing RSVP:', error);
        return false;
    }
}

/**
 * Show the main website content and hide access gate
 */
function showMainContent() {
    const accessGate = document.getElementById('accessGate');
    const mainContent = document.getElementById('mainContent');
    
    if (accessGate) {
        accessGate.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

/**
 * Initialize the "Open Invitation" button functionality
 */
function initOpenInvitationButton() {
    const openBtn = document.getElementById('openInvitationBtn');
    const passcodeContainer = document.getElementById('passcodeContainer');
    
    if (!openBtn || !passcodeContainer) return;
    
    openBtn.addEventListener('click', function() {
        // Hide the button
        openBtn.classList.add('hidden');
        
        // Show the passcode container with animation
        passcodeContainer.classList.add('visible');
        
        // Focus on the input field
        const accessCodeInput = document.getElementById('accessCode');
        if (accessCodeInput) {
            setTimeout(function() {
                accessCodeInput.focus();
            }, 300);
        }
    });
}

/**
 * Initialize the access gate system
 */
async function initAccessGate() {
    const accessGate = document.getElementById('accessGate');
    const mainContent = document.getElementById('mainContent');
    
    // If no access gate exists (admin page), skip
    if (!accessGate || !mainContent) {
        return;
    }
    
    // Initialize the open invitation button
    initOpenInvitationButton();
    
    // Check if user already has access
    if (hasAccessCode()) {
        // Restore the code data for RSVP form
        const storedCode = getStoredAccessCode();
        if (storedCode && window.RSVPModule) {
            window.RSVPModule.setCurrentCode(storedCode);
        }
        showMainContent();
        
        // Check if code has no remaining guests, RSVP was already submitted, or exists in Firestore
        if (storedCode && storedCode.remainingGuests <= 0) {
            showAlreadySubmittedMessage();
        } else if (hasSubmittedRSVP()) {
            showAlreadySubmittedMessage();
        } else if (storedCode && storedCode.code) {
            // Check Firestore for existing RSVP
            await checkAndHandleExistingRSVP(storedCode.code);
        }
        return;
    }
    
    // Setup access code form handler
    const accessForm = document.getElementById('accessCodeForm');
    const accessCodeInput = document.getElementById('accessCode');
    const accessCodeError = document.getElementById('accessCodeError');
    
    if (!accessForm) return;
    
    accessForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = accessCodeInput.value.trim();
        
        if (!code) {
            if (accessCodeError) {
                accessCodeError.textContent = 'Por favor, introduce tu código de invitación.';
            }
            accessCodeInput.classList.add('error');
            return;
        }

        // Clear previous error
        if (accessCodeError) {
            accessCodeError.textContent = '';
        }
        accessCodeInput.classList.remove('error');

        // Show loading state
        const submitBtn = accessForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Verificando...';
        submitBtn.disabled = true;

        try {
            // Validate the code using the InvitationCodes module (for access only, not RSVP)
            const codeData = await window.InvitationCodes.validateCodeForAccess(code);
            
            // Store the validated code for session
            storeAccessCode(codeData);
            
            // Set code for RSVP module
            if (window.RSVPModule) {
                window.RSVPModule.setCurrentCode(codeData);
            }
            
            // Show main content
            showMainContent();
            
            // Check if RSVP was already submitted for this code OR if code has no remaining guests
            if (codeData.remainingGuests <= 0) {
                showAlreadySubmittedMessage();
            } else {
                await checkAndHandleExistingRSVP(codeData.code);
            }
            
        } catch (error) {
            if (accessCodeError) {
                accessCodeError.textContent = error.message;
            }
            accessCodeInput.classList.add('error');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Real-time uppercase conversion
    if (accessCodeInput) {
        accessCodeInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
            if (this.value.trim()) {
                clearError(this);
            }
        });
    }
}

// ==================== COUNTDOWN TIMER ====================

/**
 * Wedding date - June 27, 2026 at midnight in Spain (Europe/Madrid timezone)
 * Using explicit timezone offset for summer time (+02:00)
 */
const WEDDING_DATE = new Date('2026-06-27T00:00:00+02:00');

/**
 * Countdown interval ID for cleanup
 */
let countdownIntervalId = null;

/**
 * Update the countdown timer display
 */
function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    // If the wedding date has passed, show zeros and clear interval
    if (diff <= 0) {
        document.getElementById('countdown-days').textContent = '0';
        document.getElementById('countdown-hours').textContent = '0';
        document.getElementById('countdown-minutes').textContent = '0';
        document.getElementById('countdown-seconds').textContent = '0';
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');

    if (daysEl) {
        daysEl.textContent = days;
    }
    if (hoursEl) {
        hoursEl.textContent = hours;
    }
    if (minutesEl) {
        minutesEl.textContent = minutes;
    }
    if (secondsEl) {
        secondsEl.textContent = seconds;
    }
}

/**
 * Initialize the countdown timer
 */
function initCountdown() {
    const countdown = document.getElementById('countdown');
    if (!countdown) return;

    // Clear any existing interval to prevent memory leaks
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
    }

    // Update immediately
    updateCountdown();

    // Update every second
    countdownIntervalId = setInterval(updateCountdown, 1000);
}

// ==================== SCROLL REVEAL ANIMATIONS ====================

/**
 * Observer for scroll reveal animations
 */
let scrollObserver = null;

/**
 * Initialize scroll reveal animations using Intersection Observer
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length === 0) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: just show all elements
        revealElements.forEach(function(el) {
            el.classList.add('revealed');
        });
        return;
    }

    // Create observer
    scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Stop observing to allow re-animation on scroll back
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all reveal elements
    revealElements.forEach(function(el) {
        scrollObserver.observe(el);
    });
}

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializa todas las funcionalidades cuando el DOM está listo
 */
function init() {
    initFirebase();
    initAccessGate();
    initMobileNav();
    initSmoothScroll();
    initInvitationCodeVerification();
    initRSVPForm();
    initHeaderScroll();
    initActiveNavHighlight();
    initCountdown();
    initScrollReveal();
}

// Ejecutar cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
