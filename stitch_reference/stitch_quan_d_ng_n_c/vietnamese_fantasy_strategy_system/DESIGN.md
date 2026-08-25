---
name: Vietnamese Fantasy Strategy System
colors:
  surface: '#220e07'
  surface-dim: '#220e07'
  surface-bright: '#4e332a'
  surface-container-lowest: '#1c0904'
  surface-container-low: '#2c160e'
  surface-container: '#311a12'
  surface-container-high: '#3d241c'
  surface-container-highest: '#492e26'
  on-surface: '#ffdbd0'
  on-surface-variant: '#c5c6cd'
  inverse-surface: '#ffdbd0'
  inverse-on-surface: '#442a22'
  outline: '#8f9097'
  outline-variant: '#44474d'
  surface-tint: '#b9c7e4'
  primary: '#b9c7e4'
  on-primary: '#233148'
  primary-container: '#0a192f'
  on-primary-container: '#74829d'
  inverse-primary: '#515f78'
  secondary: '#ffb779'
  on-secondary: '#4c2700'
  secondary-container: '#955200'
  on-secondary-container: '#ffd9bc'
  tertiary: '#ffb4a8'
  on-tertiary: '#690000'
  tertiary-container: '#3c0000'
  on-tertiary-container: '#e74b38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#ffdcc1'
  secondary-fixed-dim: '#ffb779'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6c3a00'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#920703'
  background: '#220e07'
  on-background: '#ffdbd0'
  surface-variant: '#492e26'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  hud-margin: 32px
  element-gap-sm: 4px
  element-gap-md: 12px
---

## Brand & Style

The design system embodies the "Vietnamese Fantasy Strategy" aesthetic, merging historical gravitas with high-end digital craftsmanship. It evokes the feeling of an ancient epic—legendary, authoritative, and tactically deep. The target audience includes strategy enthusiasts and culture-focused gamers who appreciate premium, immersive interfaces.

The visual style is **Tactile Modernism**. It rejects flat design in favor of physical depth, using subtle gradients, inner bevels, and layered textures that mimic lacquered wood, weathered bronze, and heavy silk. Design elements are framed by rhythmic Eastern motifs, specifically utilizing stylized Dong Son drum patterns and bamboo lattice-work to ground the "Safe" visual identity in authentic Vietnamese heritage.

## Colors

The palette is anchored by **Deep Navy (#0A192F)**, serving as the foundational surface for all HUD and player-controlled territory, ensuring a high-contrast environment for tactical decision-making. 

**Bronze Gold (#CD7F32)** is the primary accent, used exclusively for high-tier interactions: troop deployment, rewards, and critical command buttons. Its metallic sheen provides a premium "hero" feel against the dark navy. **Earth Red (#8B0000)** is reserved for systemic friction: enemy movements, critical health, and destructive actions.

Supportive environmental tones—**Warm Wood Brown**, **Rice Green**, and **Bamboo Green**—are used for contextual UI elements related to village management and military infrastructure, ensuring the interface feels connected to the 3D game world.

## Typography

The typography strategy creates a tension between the "Epic" and the "Functional." 

**Playfair Display** handles all narrative and structural headers. Its high-contrast serifs provide a literary, historical quality suitable for a "Dựng Nước" (Nation Building) narrative. For the "Display Hero" and "Headline" levels, use tighter letter spacing to increase the sense of authority.

**Be Vietnam Pro** provides the mechanical backbone. It is chosen for its exceptional handling of Vietnamese diacritics, ensuring that complex tonal marks do not clash with line heights. Body copy should maintain generous line spacing (1.6) to ensure readability during intense gameplay sessions.

## Layout & Spacing

The layout follows a **Fixed HUD model** with a **Fluid Tactical Overlay**. Main interface elements (Mini-map, Resource Bars, Unit Trays) are anchored to the screen edges with a consistent 32px safe-zone margin. 

A strict 8px grid governs the internal spacing of components. Modals and menus occupy a centered fixed-width container (max 1200px on desktop) to prevent eye strain. On mobile, the layout reflows to a single-column stack with bottom-anchored primary actions for thumb accessibility.

Gaps between interactive units (like troop cards) use a 16px gutter to prevent accidental taps, while nested information (like resource counts) uses a 4px micro-gap.

## Elevation & Depth

This system uses **Tonal Layering and Material Bevels** to convey hierarchy. 

1.  **Base Layer:** The game world/map.
2.  **HUD Layer:** Deep Navy (#0A192F) with a 85% opacity, featuring a subtle inner glow (Bronze Gold) to simulate a physical frame.
3.  **Active Component Layer:** Cards and Modals use a low-opacity "Rice Paper" texture overlay and a 1px Bronze Gold stroke.
4.  **Floating/Action Layer:** Primary buttons use ambient shadows (15% opacity Black, 20px blur) to appear "pressed" or "raised" above the HUD.

Use subtle backdrop blurs (20px) on all full-screen modals to maintain a connection to the 3D environment while focusing the player's attention on the data.

## Shapes

The shape language is **Structured and Softened**. 

Standard components utilize a 0.25rem (4px) corner radius to provide a "hand-carved" feel rather than a machine-perfect sharp edge. Larger containers like narrative panels or the Mini-map frame use the `rounded-lg` (8px) setting. 

Circular shapes are strictly reserved for unit icons and the "Ô Quan" seeding mechanic to mimic the roundness of the traditional game pieces (sỏi). All decorative borders should incorporate the "Cloud" (Mây ngũ sắc) or "Bamboo" motifs at the joints of the frames.

## Components

### Buttons
Primary buttons (Commands) are Bronze Gold with white text, featuring a subtle 3D inner bevel. Secondary buttons (Navigation) use a Deep Navy background with a Bronze Gold border. Danger buttons (Retreat/Cancel) use Earth Red with a weathered texture.

### Cards (Unit/Building)
Cards feature a vertical hierarchy: a stylized 3D render at the top, followed by a Bronze Gold divider with Dong Son motifs, and stats in Be Vietnam Pro at the bottom.

### Resource Bars
Resource bars are encased in a "Bamboo" frame. The fill color corresponds to the resource type (Rice Green for food, Water Blue for river control).

### Inputs & Checkboxes
Input fields use a dark "Well" effect (inset shadow) to appear carved into the UI. Checkboxes are styled as small wooden toggles or lacquered tiles that flip when selected.

### Modals
Modals are framed with a complex "Bronze Gold" border. The header is always centered in Playfair Display, supported by decorative "Mây ngũ sắc" (Five-colored clouds) in the corners to elevate the "Premium" fantasy feel.