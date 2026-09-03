# Design Theme Examples

This document provides detailed examples of distinctive design themes with specific color palettes, typography choices, and visual characteristics.

## Solarpunk

**Theme Characteristics:**
- Optimistic, eco-futuristic aesthetic
- Natural forms combined with technology
- Emphasis on sustainability and growth

**Color Palette:**
```css
:root {
  --color-primary: #2D5016;      /* Deep forest green */
  --color-secondary: #7CB342;    /* Vibrant leaf green */
  --color-accent: #FFB300;       /* Warm solar yellow */
  --color-background: #F5F5DC;   /* Natural beige */
  --color-surface: #FFFFFF;
  --color-text: #1B3A1B;
}
```

**Typography:**
- Headlines: Space Grotesk, Outfit (geometric sans with rounded features)
- Body: Source Serif Pro, Crimson Text (humanist serif)

**Visual Elements:**
- Organic shapes and flowing lines
- Botanical illustrations or geometric plant patterns
- Gradient overlays suggesting sunlight
- Rounded corners on components

**Background Patterns:**
```css
background: 
  radial-gradient(circle at 20% 50%, rgba(124, 179, 66, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(255, 179, 0, 0.1) 0%, transparent 50%),
  linear-gradient(135deg, #F5F5DC 0%, #E8E4D0 100%);
```

## Cyberpunk

**Theme Characteristics:**
- High-tech, dystopian aesthetic
- Neon accents on dark backgrounds
- Sharp angles and glitch effects

**Color Palette:**
```css
:root {
  --color-primary: #0A0E27;      /* Deep midnight blue */
  --color-secondary: #1A1F3A;    /* Dark slate */
  --color-accent: #00F0FF;       /* Neon cyan */
  --color-accent-2: #FF006E;     /* Hot magenta */
  --color-background: #050810;
  --color-text: #E0E0E0;
}
```

**Typography:**
- Headlines: Orbitron, Rajdhani (geometric, futuristic)
- Body: IBM Plex Mono, JetBrains Mono (monospace)

**Visual Elements:**
- Sharp angles and diagonal cuts
- Neon glow effects (box-shadow with color)
- Scan line patterns
- Grid overlays

**Effects:**
```css
.neon-glow {
  text-shadow: 
    0 0 5px #00F0FF,
    0 0 10px #00F0FF,
    0 0 20px #00F0FF,
    0 0 40px #00F0FF;
}

.glitch-effect {
  animation: glitch 0.3s infinite;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}
```

## Brutalist

**Theme Characteristics:**
- Raw, unrefined aesthetic
- Heavy use of typography
- Unconventional layouts

**Color Palette:**
```css
:root {
  --color-primary: #000000;
  --color-secondary: #FFFFFF;
  --color-accent: #FF0000;       /* Bold red accent */
  --color-background: #E0E0E0;
  --color-text: #000000;
}
```

**Typography:**
- Headlines: Space Mono, Courier New (monospace, bold)
- Body: Arial, Helvetica (intentionally plain)
- Large, dominant text treatments

**Visual Elements:**
- Raw borders (thick, black)
- Asymmetric layouts
- Overlapping elements
- Minimal color, maximum contrast
- Unconventional alignment

**Layout Characteristics:**
```css
/* Bold, unconventional positioning */
.brutalist-header {
  border: 5px solid #000;
  padding: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Overlapping elements */
.overlap-section {
  position: relative;
  z-index: 1;
  margin-top: -3rem;
  border: 3px solid #000;
  background: #FFF;
}
```

## Nordic Minimalism

**Theme Characteristics:**
- Clean, functional aesthetic
- Muted, natural colors
- Emphasis on whitespace and clarity

**Color Palette:**
```css
:root {
  --color-primary: #2E3440;      /* Dark slate gray */
  --color-secondary: #4C566A;    /* Medium gray */
  --color-accent: #5E81AC;       /* Soft blue */
  --color-accent-warm: #BF616A;  /* Muted red */
  --color-background: #ECEFF4;   /* Light gray */
  --color-surface: #FFFFFF;
  --color-text: #2E3440;
}
```

**Typography:**
- Headlines: Inter (used correctly with varied weights)
- Body: Source Sans Pro, Open Sans
- Emphasis on spacing and hierarchy

**Visual Elements:**
- Generous whitespace
- Soft shadows
- Rounded corners (subtle)
- Photography as focal points

**Design Principles:**
```css
/* Subtle elevation */
.card {
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04),
              0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

/* Ample spacing */
.section {
  padding: 4rem 2rem;
}
```

## Retro Computing

**Theme Characteristics:**
- Nostalgic 80s/90s computing aesthetic
- CRT monitor effects
- Pixelated elements

**Color Palette:**
```css
:root {
  --color-primary: #000000;
  --color-secondary: #00FF00;    /* Bright terminal green */
  --color-accent: #FFD700;       /* Gold/amber */
  --color-background: #1A1A1A;
  --color-text: #00FF00;
}
```

**Typography:**
- Headlines: VT323, Press Start 2P (pixel fonts)
- Body: IBM Plex Mono, Source Code Pro

**Visual Elements:**
- Scanline effects
- Monochrome green or amber text
- ASCII art elements
- Pixelated borders

**Retro Effects:**
```css
/* CRT scanline effect */
.crt-screen::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
}

/* Terminal glow */
.terminal-text {
  color: #00FF00;
  text-shadow: 0 0 5px #00FF00;
  font-family: 'VT323', monospace;
}
```

## Implementation Notes

**Choosing a Theme:**
1. Consider the project's purpose and audience
2. Select a theme that reinforces the message
3. Adapt theme elements rather than copying exactly
4. Mix themes when appropriate for unique results

**Customization:**
- Themes are starting points, not rigid templates
- Adjust colors to match brand or content
- Combine elements from multiple themes
- Create variations within a theme family

**Consistency:**
- Use CSS variables for all theme values
- Maintain the theme throughout the experience
- Document theme choices for future reference
- Test theme in both light and dark modes if applicable
