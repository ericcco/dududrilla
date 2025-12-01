# Copilot Instructions for dududrilla

## Project Overview

This is a **wedding website** for Sandra & Eduard. It's a static website built with vanilla HTML, CSS, and JavaScript—no build tools or frameworks required.

## Project Structure

```
/
├── index.html      # Main HTML page with all sections
├── styles.css      # All CSS styles including responsive design
├── script.js       # JavaScript for navigation, form validation, and interactivity
└── README.md       # Project documentation
```

## Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties (CSS variables), Flexbox, Grid, and responsive design
- **JavaScript**: Vanilla ES6+ with strict mode enabled
- **Fonts**: Google Fonts (Cormorant Garamond, Montserrat)

## Coding Conventions

### HTML

- Use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<footer>`)
- Follow BEM naming convention for classes (e.g., `block__element--modifier`)
- Include appropriate ARIA labels for accessibility
- Comments should be wrapped with `<!-- ==================== SECTION NAME ==================== -->`

### CSS

- Use CSS custom properties defined in `:root` for colors, fonts, and spacing
- Follow the existing variable naming pattern (e.g., `--color-gold`, `--spacing-md`)
- Use BEM class naming convention
- Organize styles in logical sections with comment headers
- Support responsive design with mobile-first approach
- Include `prefers-reduced-motion` media query for accessibility

### JavaScript

- Use `'use strict'` directive at the top of the file
- Use function declarations with JSDoc comments
- Use `const` and `let` (never `var`)
- Use `function` keyword for top-level functions (not arrow functions)
- Use `forEach` for array iteration
- Validate forms client-side with clear error messages
- Initialize all functionality through an `init()` function called on DOMContentLoaded

## Color Palette

The wedding theme uses elegant, romantic colors defined as CSS variables:

- `--color-cream`: #FAF8F5 (background)
- `--color-pink`: #E8D5D5 (accent)
- `--color-gold`: #C9A96E (primary accent)
- `--color-text`: #4A4A4A (main text)

## Content Language

The website content is in **Spanish**. When adding or modifying text content, maintain Spanish language consistency. Comments in code can be in English.

## Building and Testing

This is a static website with no build process required.

### Local Development

1. Open `index.html` directly in a web browser, or
2. Use a local development server (e.g., `python -m http.server 8000` or VS Code Live Server)

### Testing

- Test responsive design at various breakpoints (mobile: <768px, tablet: 768px-1023px, desktop: ≥1024px)
- Verify form validation works correctly
- Check navigation and smooth scrolling behavior
- Test on multiple browsers (Chrome, Firefox, Safari)

## Key Features

1. **Fixed navigation header** with mobile hamburger menu
2. **Smooth scrolling** between sections with header offset
3. **RSVP form** with client-side validation
4. **Responsive design** optimized for all device sizes
5. **Accessibility** features including focus states and reduced motion support

## When Making Changes

- Preserve the elegant, minimalist aesthetic
- Maintain consistency with existing code style and patterns
- Test responsive behavior after CSS changes
- Ensure form validation continues to work after JavaScript changes
- Keep the BEM naming convention for new CSS classes
