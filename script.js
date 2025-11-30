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

/**
 * Inicializa el formulario RSVP
 */
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    const confirmation = document.getElementById('rsvpConfirmation');
    const rsvpButtons = document.getElementById('rsvpButtons');

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
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            // Recoger datos del formulario
            const formData = {
                nombre: document.getElementById('nombre').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                acompanantes: document.getElementById('acompanantes').value,
                asistencia: document.querySelector('input[name="asistencia"]:checked').value,
                alergias: document.getElementById('alergias').value.trim()
            };

            // En producción, los datos se enviarían a un servidor
            // Por ahora, simplemente mostramos el mensaje de confirmación

            // Mostrar mensaje de confirmación
            form.hidden = true;
            if (rsvpButtons) {
                rsvpButtons.hidden = true;
            }
            if (confirmation) {
                confirmation.hidden = false;
            }

            // Scroll al mensaje de confirmación
            if (confirmation) {
                confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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

    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Añadir sombra más pronunciada al hacer scroll
        if (scrollTop > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        }
        
        lastScrollTop = scrollTop;
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

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializa todas las funcionalidades cuando el DOM está listo
 */
function init() {
    initMobileNav();
    initSmoothScroll();
    initRSVPForm();
    initHeaderScroll();
    initActiveNavHighlight();
}

// Ejecutar cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
