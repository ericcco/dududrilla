# Sandra & Eduard - Wedding Website

A beautiful, elegant wedding website for Sandra & Eduard's celebration. This is a static website built with vanilla HTML, CSS, and JavaScript—no build tools or frameworks required.

## Features

- **Elegant invitation system** with animated envelope opening and access code verification
- **Countdown timer** to the wedding date
- **RSVP form** with client-side validation and Firebase integration
- **Responsive design** optimized for all device sizes (mobile, tablet, desktop)
- **Admin panel** for managing invitation codes and viewing RSVPs
- **Smooth scroll navigation** with fixed header
- **Scroll reveal animations** for enhanced visual experience
- **Accessibility features** including focus states and reduced motion support

## Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties (CSS variables), Flexbox, Grid, and responsive design
- **JavaScript**: Vanilla ES6+ with strict mode enabled
- **Firebase**: Firestore for data storage and Authentication for admin access
- **Fonts**: Google Fonts (Cormorant Garamond, Montserrat, Caveat, Bebas Neue)

## Project Structure

```
/
├── index.html          # Main wedding website with all sections
├── admin.html          # Admin panel for managing RSVPs and codes
├── styles.css          # All CSS styles including responsive design
├── script.js           # Main JavaScript for navigation, forms, and interactivity
├── js/
│   ├── firebase-config.js       # Firebase configuration
│   ├── firebase-config.example.js # Example Firebase config template
│   ├── auth.js                  # Authentication module
│   ├── invitation-codes.js      # Invitation code management
│   ├── rsvp.js                  # RSVP submission handling
│   └── admin-dashboard.js       # Admin panel functionality
├── img/                # Image assets
└── README.md           # This file
```

## Getting Started

### Prerequisites

- A web browser (Chrome, Firefox, Safari, or Edge)
- For Firebase features: A Firebase project with Firestore and Authentication enabled

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ericcco/dududrilla.git
   cd dududrilla
   ```

2. Configure Firebase:
   - Copy `js/firebase-config.example.js` to `js/firebase-config.js`
   - Update with your Firebase project credentials

3. Start a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve
   ```

4. Open `http://localhost:8000` in your browser

### Testing

- Test responsive design at various breakpoints (mobile: < 768px, tablet: 768px-1023px, desktop: ≥ 1024px)
- Verify form validation works correctly
- Check navigation and smooth scrolling behavior
- Test on multiple browsers

## Content Language

The website content is in **Spanish**. When adding or modifying text content, maintain Spanish language consistency.

## Color Palette

The wedding theme uses elegant, romantic colors:

| Variable | Color | Usage |
|----------|-------|-------|
| `--color-cream` | #fdf3e7 | Background |
| `--color-red` | #E84B30 | Primary accent |
| `--color-gold` | #C9A96E | Secondary accent |
| `--color-text` | #4A4A4A | Main text |

## License

This project is private and intended for personal use.