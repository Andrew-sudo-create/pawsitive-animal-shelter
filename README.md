# Pawsitive Animal Shelter Website

A responsive website for Pawsitive Animal Shelter, built with HTML, CSS, and JavaScript.

## Project Structure

```
Pawsitive website/
├── index.html              # Home page
├── about.html              # About page
├── contact.html            # Contact page
├── dogs.html               # Dogs listing page
├── donate.html             # Donation page
├── script.js               # Main JavaScript file
├── css/
│   └── style.css           # Main stylesheet
├── images/                 # Image assets
├── documents/              # Documents folder
└── references/             # Reference materials
```

## Pages

- **Home** (home.html) - Landing page with hero section, mission, and key information
- **About** (about.html) - Information about the organization
- **Meet Our Dogs** (dogs.html) - Browse and search available dogs for adoption
- **Contact** (contact.html) - Contact form and information
- **Donate** (donate.html) - Donation options and form

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Mobile hamburger menu
- ✅ Animated counters
- ✅ Fade-in animations on scroll
- ✅ Sticky header with shadow
- ✅ Smooth scrolling
- ✅ Dog search functionality
- ✅ Filter buttons for dogs
- ✅ Contact form validation
- ✅ Donation form with multiple payment options

## Contact Information

**Phone:** +27 76 485 4448  
**Email:** pawsitiverasa@gmail.com  
**Address:** Plot 143 Pretorius street Laezonia, Centurion, Gauteng, 0026  
**Facebook:** [Pawsitive Animal Shelter](https://www.facebook.com/p/Pawsitive-Animal-Shelter-61573736377122/)

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Firebase (Auth, Firestore, Storage) for the admin content portal
- Hosted on Vercel
- Font Awesome Icons
- Google Fonts (Poppins)

## Admin portal (Firebase)

Editors can update dogs, people, page text, and images without changing the site layout.

1. Follow **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** to connect Firebase
2. Open `/admin/` and sign in with the single admin account
3. Manage dogs, people, pages, and site settings

Public pages load published content from Firestore when configured; otherwise the static HTML fallback is shown.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## File Sizes

- **script.js** - Organized and optimized
- **style.css** - Comprehensive styling with clear sections
- **HTML files** - Semantic HTML structure

