---
name: Horizon Aviator
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#42474f'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727780'
  outline-variant: '#c2c6d1'
  surface-tint: '#2f6097'
  primary: '#003b6b'
  on-primary: '#ffffff'
  primary-container: '#1d5288'
  on-primary-container: '#9cc6ff'
  inverse-primary: '#a2c9ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fdbf31'
  on-secondary-container: '#6e4f00'
  tertiary: '#00440d'
  on-tertiary: '#ffffff'
  tertiary-container: '#035e17'
  on-tertiary-container: '#84d67f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#0d487e'
  secondary-fixed: '#ffdea3'
  secondary-fixed-dim: '#fabd2e'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built for an audience of aspiring aviators who value precision, discipline, and clarity. The brand personality is **authoritative yet encouraging**, reflecting the high-stakes nature of ANAC examinations while providing a supportive environment for intense study.

The design style is **Modern Corporate with a focus on Information Density**. It utilizes a clean, structured interface that avoids distractions to maximize study efficiency. By using precise alignment, ample whitespace, and a high-fidelity finish, the system evokes a sense of "Aviation Expertise"—mimicking the reliability of flight instruments and professional technical manuals. 

Visual cues emphasize:
- **Efficiency:** Streamlined navigation for quick access to exam modules.
- **Authority:** A sophisticated blue-dominant palette that communicates institutional trust.
- **Focus:** Intentional use of color to highlight progress and critical errors without overwhelming the learner.

## Colors

The palette is derived directly from the core brand identity, optimized for digital accessibility and long-form reading.

- **Primary Blue (#1D5288):** Used for navigation, headers, and primary actions. It represents the sky and professional stability.
- **Accent Gold (#F9BC2D):** Used sparingly for "Power Actions," calls to action, and highlighting achievement. It provides a warm contrast to the cooler primary tones.
- **Functional Neutrals:** A range of Slate grays provides a sophisticated base for content, ensuring high legibility for technical text.
- **Study Semantics:** 
    - **Success Green:** Indicates correct answers and completed modules.
    - **Error Red:** Flags incorrect choices and critical warnings.
    - **Study Blue Tints:** Light tints are used for progress tracking and highlighting selected questions to prevent visual fatigue.

## Typography

The typography system balances modern aesthetics with technical precision.

- **Hanken Grotesk** is used for headlines. Its sharp, contemporary geometry provides a professional edge that feels technical and "engineered."
- **Inter** is the workhorse for body copy and exam questions. It is chosen for its exceptional legibility at small sizes and its neutral, distraction-free character.
- **JetBrains Mono** is utilized for specialized labels, question IDs, and data-heavy tables, lending an air of aeronautical data-logging and instrumentation.

All exam content should prioritize the `body-lg` or `body-md` roles to ensure comfort during long study sessions. Labels for question numbers or timer data should use `label-caps` for a distinct, high-contrast look.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to maintain structural integrity of complex exam layouts, transitioning to a fluid model for mobile devices.

- **Desktop Layout:** A 12-column grid centered in a 1200px container. This allows for a "Focus Mode" sidebar (3 columns) and a primary "Question Area" (9 columns).
- **Rhythm:** An 8px base unit (linear scaling) governs all padding and margins. 
- **Efficiency:** Spacing is tighter than a typical consumer app to allow more information on screen (question text + options + timer) without scrolling, crucial for time-pressured simulations.
- **Breakpoints:**
    - Mobile (< 768px): Single column, 16px side margins.
    - Tablet (768px - 1024px): Collapsible sidebar, fluid content.
    - Desktop (> 1024px): Fixed width, centered.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**. 

To maintain a professional "instrument-panel" feel, the system avoids heavy, dramatic shadows. Instead:
- **Base Layer:** A very light gray background (#F8FAFC) separates the canvas from the content.
- **Surface Layer:** White containers for questions and cards, using a 1px solid border (#E2E8F0) rather than a shadow.
- **Active Elevation:** Only the primary action buttons and "Active" state question cards receive a subtle, diffused shadow (0px 4px 12px rgba(29, 82, 136, 0.08)) to indicate focus.
- **Depth through Saturation:** Important progress bars and timer boxes use high-saturation backgrounds to "pop" from the neutral layout.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding maintains a professional, serious tone without feeling aggressive or sharp. It strikes a balance between the industrial feel of an aircraft cockpit and the modern usability of a SaaS platform.

- **Standard Elements:** Inputs, buttons, and small cards use 4px (0.25rem) radius.
- **Container Elements:** Large content sections use 8px (0.5rem) radius.
- **Progress Elements:** Inner progress bars use a 2px radius for a more precise, technical look.

## Components

- **Exam Cards:** High-contrast white surfaces with a 1px border. The top of the card features a blue progress indicator strip.
- **Primary Buttons:** Solid #1D5288 background with white text. Hover states shift to a slightly darker navy.
- **Study Selection:** Radio buttons and checkboxes use a custom "Tile" style—large clickable areas that turn light blue (#E8F0F8) with a 2px border (#1D5288) when selected.
- **Progress Trackers:** Horizontal bars using `study_progress_bg` as the track and `study_progress_track` as the fill. 
- **Timer Component:** A fixed-position element using `label-caps` in the Gold accent color to draw attention to remaining time without inducing panic.
- **Input Fields:** Minimalist design with a focus on focus-state visibility—a 2px Primary Blue border appears upon interaction.
- **Status Chips:** Small, condensed labels for "Correct," "Incorrect," or "Review Later," using semantic background colors with low opacity and high-contrast text.