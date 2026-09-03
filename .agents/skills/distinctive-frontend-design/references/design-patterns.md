# Design Patterns for Common Project Types

This document provides design patterns and best practices for common frontend project types.

## Landing Pages

**Key Characteristics:**
- Strong visual hierarchy
- Clear call-to-action
- Engaging hero section
- Scroll-driven reveals

**Hero Section Pattern:**
```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: 
    radial-gradient(at 30% 20%, rgba(var(--accent-rgb), 0.2) 0%, transparent 50%),
    linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  background: url('data:image/svg+xml,...') /* geometric pattern */;
  opacity: 0.1;
  animation: drift 60s infinite linear;
}

@keyframes drift {
  from { transform: translate(0, 0); }
  to { transform: translate(-50%, -50%); }
}
```

**Feature Cards Pattern:**
```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
}

.feature-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

## Dashboards

**Key Characteristics:**
- Data visualization focus
- Card-based layouts
- Responsive grid systems
- Clear information hierarchy

**Dashboard Layout Pattern:**
```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding: 2rem;
  background: var(--color-background);
}

.sidebar {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid var(--color-accent);
}
```

**Data Visualization Integration:**
```css
.chart-container {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.metric-display {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: var(--trend-background);
  color: var(--trend-color);
  font-size: 0.875rem;
}
```

## Portfolio Sites

**Key Characteristics:**
- Visual storytelling
- Project showcases
- Interactive elements
- Personal branding

**Project Showcase Pattern:**
```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 3rem;
  padding: 4rem 2rem;
}

.project-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16/10;
  cursor: pointer;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
}

.project-card:hover .project-image {
  transform: scale(1.05);
}

.project-card:hover .project-overlay {
  opacity: 1;
}
```

## Documentation Sites

**Key Characteristics:**
- Clear navigation
- Code highlighting
- Search functionality
- Responsive sidebar

**Documentation Layout Pattern:**
```css
.docs-container {
  display: grid;
  grid-template-columns: 280px 1fr 200px;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.docs-sidebar {
  position: sticky;
  top: 2rem;
  height: calc(100vh - 4rem);
  overflow-y: auto;
}

.docs-content {
  max-width: 65ch;
  line-height: 1.7;
}

.docs-toc {
  position: sticky;
  top: 2rem;
  font-size: 0.875rem;
}

/* Code block styling */
pre {
  background: var(--color-code-background);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  border: 1px solid var(--color-border);
}

code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}
```

## E-commerce

**Key Characteristics:**
- Product focus
- Trust indicators
- Clear CTAs
- Mobile-first approach

**Product Card Pattern:**
```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.product-card {
  background: var(--color-surface);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image-container {
  position: relative;
  aspect-ratio: 1;
  background: var(--color-background);
  overflow: hidden;
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.product-info {
  padding: 1.5rem;
}

.add-to-cart {
  width: 100%;
  padding: 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
```

## Blog/Magazine

**Key Characteristics:**
- Readable typography
- Article previews
- Category navigation
- Featured content

**Article Layout Pattern:**
```css
.article-container {
  max-width: 65ch;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.article-header {
  margin-bottom: 3rem;
}

.article-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.article-content {
  font-size: 1.125rem;
  line-height: 1.8;
}

.article-content p {
  margin-bottom: 1.5rem;
}

.article-content h2 {
  margin-top: 3rem;
  margin-bottom: 1rem;
  font-size: 2rem;
}

/* Drop cap for first paragraph */
.article-content p:first-of-type::first-letter {
  float: left;
  font-size: 4rem;
  line-height: 0.8;
  margin: 0.1rem 0.5rem 0 0;
  color: var(--color-accent);
  font-weight: 700;
}
```

## Interactive Tools/Apps

**Key Characteristics:**
- Responsive controls
- Real-time feedback
- Clear state changes
- Intuitive interactions

**Control Panel Pattern:**
```css
.tool-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: 100vh;
  padding: 2rem;
}

.control-panel {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 2rem;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 2rem;
}

.control-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-background);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.preview-area {
  background: var(--color-background);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
```

## Common Animation Patterns

**Page Load Sequence:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
```

**Hover Interactions:**
```css
.interactive-element {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-element::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.interactive-element:hover::after {
  opacity: 0.1;
}

.interactive-element:hover {
  transform: translateY(-2px);
}
```

**Loading States:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-background) 25%,
    var(--color-surface) 50%,
    var(--color-background) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Responsive Design Considerations

**Mobile-First Approach:**
```css
/* Base (mobile) styles */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

**Fluid Typography:**
```css
.heading {
  font-size: clamp(2rem, 4vw + 1rem, 4rem);
}

.body-text {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
}
```
