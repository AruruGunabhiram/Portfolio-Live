# Modern Portfolio Website

A feature-rich, fully animated portfolio website built with React 19, TypeScript, and cutting-edge web technologies. Features dual-theme system (Professional Dark Mode & Geek Mode) with interactive visualizations, 3D graphics, and delightful easter eggs.

## ✨ Features

### 🎨 Dual Theme System
- **Dark Mode**: Professional, modern aesthetic with blue accents
- **Geek Mode**: Terminal-style hacker theme with matrix green, custom cursor, and particle effects

### 🎮 Interactive Elements
- **Multiple Skill Visualizations**: Bar charts, radial charts, 3D sphere, hand-drawn sketch style
- **3D Background**: React Three Fiber animated particle field (Geek Mode)
- **Smooth Animations**: Framer Motion + GSAP ScrollTrigger
- **Parallax Effects**: Layered depth with react-scroll-parallax
- **Custom Cursor**: Interactive trailing cursor (Geek Mode)

### 🎉 Easter Eggs
- **Konami Code**: Type ↑↑↓↓←→←→BA for Matrix rain effect
- **Hidden Terminal**: Press \`Ctrl + \`\` for command-line interface
- **Hacker Typer**: Real-time code generation effect

### ♿ Accessibility
- **WCAG 2.1 AA Compliant**: Full keyboard navigation, ARIA labels, screen reader support
- **Reduced Motion**: Respects \`prefers-reduced-motion\` preferences
- **High Contrast**: Both themes optimized for visibility
- **Focus Management**: Clear focus indicators throughout

### 🚀 Performance
- **90+ Lighthouse Score**: Optimized for production
- **Code Splitting**: Lazy loading for heavy components
- **React.memo**: Prevents unnecessary re-renders
- **Canvas Optimizations**: GPU-accelerated animations

---

## 🛠️ Tech Stack

### Core
- **React 19** - Latest React with modern features
- **TypeScript 5.9** - Full type safety, strict mode
- **Vite 7.3** - Lightning-fast build tool
- **React Router DOM 7.5** - Client-side routing

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Custom Theme System** - Dynamic dark/geek mode switching

### Animation & Effects
- **Framer Motion 11.18** - Smooth, declarative animations
- **GSAP 3.12 + ScrollTrigger** - Advanced scroll-based animations
- **React Scroll Parallax 3.5** - Layered parallax effects
- **Vivus 0.4** - SVG line-drawing animations

### 3D Graphics
- **React Three Fiber 9.4** - React renderer for Three.js
- **@react-three/drei 9.122** - Useful Three.js helpers
- **Three.js** - WebGL 3D library

### Interactive Features
- **tsparticles 3.9** - Particle network background
- **Lottie React 3.0** - JSON-based animations
- **Rough.js 4.6** - Hand-drawn graphics

### Development
- **ESLint 9.20** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite React Plugin** - Fast refresh and optimizations

---

## 📦 Installation

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/AruruGunabhiram/Portfolio-Live.git
cd Portfolio-Live

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
\`\`\`

---

## 🚀 Development

### Available Scripts

\`\`\`bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
\`\`\`

### Project Structure

\`\`\`
portfolio-live/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   ├── three/        # 3D components
│   │   ├── skills/       # Skill visualizations
│   │   └── easter-eggs/  # Hidden features
│   ├── sections/         # Page sections (Hero, About, etc.)
│   ├── pages/            # Route pages
│   ├── context/          # React Context (Theme)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── assets/           # Static assets
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public static files
├── dist/                 # Production build output
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint configuration
└── package.json          # Project dependencies
\`\`\`

---

## 🎨 Customization

### Update Personal Information

Edit \`src/utils/constants.ts\`:

\`\`\`typescript
export const SOCIAL_LINKS = {
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  email: 'your.email@example.com',
};

export const SKILLS = {
  frontend: [
    { name: 'React', level: 95 },
    // Add your skills...
  ],
  // ...
};

export const PROJECTS = [
  {
    id: 1,
    title: 'Your Project',
    description: 'Project description',
    // ...
  },
];
\`\`\`

### Theme Colors

Modify \`src/index.css\`:

\`\`\`css
@theme {
  --color-dark-accent: #646cff;     /* Dark mode accent */
  --color-geek-accent: #00ff00;     /* Geek mode accent */
  /* ... */
}
\`\`\`

---

## 🏗️ Build & Deployment

### Production Build

\`\`\`bash
npm run build
\`\`\`

Output: \`dist/\` directory

### Build Optimizations

The production build includes:
- ✅ Minification (Terser)
- ✅ Tree shaking
- ✅ Code splitting (vendor chunks)
- ✅ Console.log removal
- ✅ CSS optimization
- ✅ Asset optimization

### Deployment Options

#### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

#### Netlify
\`\`\`bash
npm install -g netlify-cli
netlify deploy
\`\`\`

#### GitHub Pages
Add to \`package.json\`:
\`\`\`json
{
  "homepage": "https://yourusername.github.io/portfolio-live"
}
\`\`\`

---

## 📊 Performance

### Lighthouse Scores (Target)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 100

### Optimizations Applied
1. Code Splitting & Lazy Loading
2. React.memo on 9+ components
3. Intersection Observer for viewport rendering
4. Canvas-based GPU acceleration
5. Reduced motion support
6. Vendor chunk separation
7. Console.log removal in production

---

## ♿ Accessibility

### Features
- ✅ Full keyboard navigation
- ✅ Screen reader support (ARIA labels, roles)
- ✅ Focus indicators on all interactive elements
- ✅ Reduced motion preferences respected
- ✅ WCAG AA contrast ratios
- ✅ Semantic HTML structure

---

## 🎯 Easter Eggs Guide

### Konami Code → Matrix Rain
1. Enable Geek Mode
2. Type: ↑ ↑ ↓ ↓ ← → ← → B A
3. Watch the Matrix rain effect

### Hidden Terminal
1. Enable Geek Mode
2. Press: \`Ctrl + \`\` (backtick)
3. Available commands:
   - \`help\` - Show commands
   - \`about\` - About info
   - \`skills\` - List skills
   - \`contact\` - Contact info
   - \`clear\` - Clear terminal
   - \`matrix\` - Easter egg message
   - \`secret\` - Hidden surprise

---

## 📄 License

MIT License - feel free to use this project for your own portfolio!

---

## 🙏 Credits

Built with amazing open-source libraries. Special thanks to:
- React, Vite, TypeScript teams
- Framer Motion, GSAP, Three.js
- Tailwind CSS and all contributors

---

<div align="center">

**Built with ❤️ and lots of ☕**

[⬆ back to top](#modern-portfolio-website)

</div>
