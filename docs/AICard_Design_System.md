# AICard Design System

**The visual language of a kitchen that invites you to cook**

*Version 1.0 — March 2026*

---

## Design Philosophy

AICard's visual identity follows the same principle as everything else in the project: **human first, machine second.** The interface should feel like a well-organized kitchen — warm, functional, and inviting — not like a developer dashboard, an automation platform, or a generic SaaS product.

Three qualities define every visual decision:

**Warmth.** This is a tool that belongs in your home, not in an office. The palette is earthy, the typography is readable, the spacing is generous. Maria should feel welcomed, not intimidated. Jun should feel inspired, not patronized. Sam should see thoughtfulness, not decoration.

**Clarity.** Every element has a single, obvious purpose. There is no visual noise, no competing hierarchies, no elements that exist for aesthetic reasons alone. Clarity beats cleverness — in the code, in the documents, and in the interface.

**Craft.** The difference between average and excellent is attention to detail. Consistent spacing. Considered color relationships. Typography that guides the eye. Motion that communicates, never distracts. Every pixel should feel intentional — the same care that goes into a well-written recipe.

### The Kitchen Test

Before shipping any visual element, ask:

1. Does this feel like a kitchen or a control panel?
2. Would Maria understand what this element does without explanation?
3. Would Jun want to show this to friends?
4. Would Sam see craft behind the surface?
5. Does it still work in low light, on small screens, and with imperfect eyesight?

---

## Brand Identity

### Name and Wordmark

The name **AICard** is always written as one word with a capital A, capital I, and capital C. Never "AI Card" (two words), "Aicard" (single capital), or "AICARD" (all caps).

In the wordmark, "AI" and "Card" are visually connected but subtly differentiated — the "AI" is slightly lighter in weight, suggesting the AI stepping back to let the human creation (the Card) take prominence. This mirrors the "AI is the mortar, not the building" principle.

### Tagline

Primary: **A simple tool enabling endless creativity**
Secondary: **If you can follow a recipe, you can build with AI.**

### Logo

The logo is a single card shape — a rounded rectangle with soft corners — containing a minimal kitchen element. Not a chef's hat (that's the sous chef's icon). Not a circuit board or AI brain. Something that bridges the digital and the domestic: a card that could be a recipe card sitting on a kitchen counter.

The logo must work at 16×16px (favicon), 32×32px (app icon small), and full size. At small sizes, the internal detail disappears and the card shape alone carries the identity.

### Logo Clear Space

Minimum clear space around the logo equals the height of the "A" in AICard. No other element should encroach within this space.

---

## Color System

### Design Rationale

The color palette draws from the kitchen — natural materials, warm surfaces, the kind of colors you find in terracotta, linen, wood, copper, and fresh herbs. This is deliberate: it reinforces the metaphor at a subconscious level and differentiates AICard from the blue-purple-gray palette that dominates developer tools and automation platforms.

### Core Palette

#### Neutrals — The Kitchen Surfaces

These form the foundation. Everything sits on these surfaces.

| Token | Hex | Usage |
|-------|-----|-------|
| `--surface-lightest` | `#FDFAF6` | Page background, primary canvas |
| `--surface-light` | `#F5F0E8` | Card backgrounds, elevated surfaces |
| `--surface-mid` | `#E8E0D4` | Borders, dividers, subtle separators |
| `--surface-dark` | `#D4C9B8` | Disabled states, muted backgrounds |
| `--surface-darkest` | `#8C7E6A` | Placeholder text, tertiary information |

These are not pure grays. They carry a warm, linen-like undertone that makes the interface feel lived-in rather than sterile.

#### Text — Ink on Paper

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#2C2416` | Headings, primary body text, labels |
| `--text-secondary` | `#5C5040` | Secondary text, descriptions, metadata |
| `--text-tertiary` | `#8C7E6A` | Hints, timestamps, de-emphasized content |
| `--text-inverse` | `#FDFAF6` | Text on dark backgrounds |

`--text-primary` is a deep, warm brown — not pure black. Pure black on warm surfaces creates visual tension. This brown-black anchors the text without fighting the palette.

#### Accent — Copper and Herb

Two accent colors provide all the emphasis AICard needs:

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-primary` | `#C17832` | Primary actions, active states, focus rings, links |
| `--accent-primary-hover` | `#A86528` | Hover state for primary accent |
| `--accent-primary-subtle` | `#F5E6D0` | Light background for highlighted areas |
| `--accent-secondary` | `#5B8C5A` | Success states, active recipes, positive feedback |
| `--accent-secondary-hover` | `#4A7A49` | Hover state for secondary accent |
| `--accent-secondary-subtle` | `#E2EDDF` | Light background for success-related areas |

The copper (`--accent-primary`) is the dominant action color — warm, distinctive, immediately recognizable. It evokes copper pots, warmth, and craft. It is AICard's signature color.

The herb green (`--accent-secondary`) is reserved for positive states: a recipe running successfully, a connection established, something working as intended. It evokes freshness and growth.

#### Semantic Colors — What Needs Attention

| Token | Hex | Usage |
|-------|-----|-------|
| `--status-info` | `#4A7FA5` | Informational states, sous chef suggestions |
| `--status-warning` | `#D4943A` | Attention needed, approaching limits |
| `--status-error` | `#C45D4A` | Errors, failures, broken connections |
| `--status-success` | `#5B8C5A` | Same as accent-secondary — success is green |

These semantic colors are used sparingly. Most of the interface lives in the neutral and accent range. Semantic colors appear only when the system genuinely needs to communicate a state.

### Dark Mode

AICard supports dark mode as a first-class experience, not an afterthought.

| Token | Light | Dark |
|-------|-------|------|
| `--surface-lightest` | `#FDFAF6` | `#1C1814` |
| `--surface-light` | `#F5F0E8` | `#2A2420` |
| `--surface-mid` | `#E8E0D4` | `#3A3228` |
| `--surface-dark` | `#D4C9B8` | `#4A4034` |
| `--text-primary` | `#2C2416` | `#E8E0D4` |
| `--text-secondary` | `#5C5040` | `#B8A88C` |
| `--accent-primary` | `#C17832` | `#D4903E` |
| `--accent-secondary` | `#5B8C5A` | `#6FA06E` |

In dark mode, the warm undertone remains. The backgrounds are deep brown-blacks, not blue-blacks or pure blacks. The warmth of the kitchen carries into evening.

### Color Usage Rules

1. **Never use pure black (`#000000`) or pure white (`#FFFFFF`).** Always use the palette tokens.
2. **Accent colors are for actions and states, not decoration.** If something is copper, it should be tappable or active.
3. **Semantic colors never appear without a reason.** No decorative red, yellow, or blue elements.
4. **Backgrounds never compete with content.** The surface palette exists to recede.
5. **Test every color combination for WCAG AA contrast.** Minimum 4.5:1 for body text, 3:1 for large text and UI elements.
6. **The copper accent must be distinguishable from error red** at every size. Never place them adjacent without clear spatial separation.

---

## Typography

### Design Rationale

AICard's typography must serve two masters: it must be warm and inviting for Maria (readable, familiar, not cold or technical) and it must signal quality to Sam (not a toy, not generic, not default system fonts). It must render well at every size and on every platform the browser supports.

### Type Scale

AICard uses a modular scale based on a 1.25 ratio (Major Third), anchored at 16px body text. This produces a harmonious progression that never jumps too far between levels.

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 12px / 0.75rem | 1.5 | Regular | Timestamps, metadata, legal |
| `--text-sm` | 14px / 0.875rem | 1.5 | Regular | Secondary labels, helper text |
| `--text-base` | 16px / 1rem | 1.6 | Regular | Body text, card configuration values |
| `--text-md` | 18px / 1.125rem | 1.5 | Regular | Card descriptions, recipe purpose |
| `--text-lg` | 20px / 1.25rem | 1.4 | Medium | Section headings, step names |
| `--text-xl` | 25px / 1.5625rem | 1.3 | Semibold | Page headings, recipe names |
| `--text-2xl` | 32px / 2rem | 1.2 | Semibold | Feature headings, hero text |
| `--text-3xl` | 40px / 2.5rem | 1.1 | Bold | Display, landing page |

### Font Families

**Display / Headings:** A warm, characterful serif or slab-serif that signals craft and approachability. Choose a font with personality but not eccentricity — the kind of typeface you'd see on a quality cookbook or artisan product label.

Candidates: **Fraunces** (variable, open source, warm and expressive), **Newsreader** (readable, editorial quality), or **Lora** (elegant, broadly available). The key attribute: it should feel handmade, not mechanical.

```css
--font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
```

**Body / UI:** A humanist sans-serif with excellent readability at small sizes and a warm character that pairs well with the display font. Not geometric (too cold), not grotesque (too generic).

Candidates: **Source Sans 3** (designed for readability, open source, excellent language support), **Nunito Sans** (rounded terminals, friendly), or **DM Sans** (modern humanist, good contrast with a serif display). The key attribute: it should feel welcoming, not sterile.

```css
--font-body: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
```

**Monospace (configuration values, code):** Used sparingly — only where the content is genuinely technical or where visual alignment matters. Should feel warm for a monospace.

```css
--font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
```

### Typography Rules

1. **Headings use the display font. Everything else uses the body font.** There is no third category.
2. **Body text is always 16px minimum.** Never smaller for primary content, even on mobile.
3. **Line length should not exceed 72 characters** for body text. Use `max-width` to constrain.
4. **Paragraph spacing is 1em.** Half-space between related items, full space between distinct blocks.
5. **Never use all-caps for more than 2-3 words.** Small-caps with letter-spacing is acceptable for labels.
6. **Bold is for emphasis within text, not for entire paragraphs.** If everything is bold, nothing is.
7. **Italic is for the sous chef's voice** — notes, suggestions, and aside commentary use italic. This visually distinguishes the AI's contributions from the user's content.
8. **Use the display font for recipe names and card type names** — these are the "proper nouns" of AICard.

---

## Spacing and Layout

### Spacing Scale

AICard uses an 8px base unit. All spacing values are multiples of 8.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Inline spacing, icon gaps |
| `--space-2` | 8px | Tight padding, compact elements |
| `--space-3` | 12px | Small padding, list item spacing |
| `--space-4` | 16px | Default padding, form field spacing |
| `--space-5` | 24px | Card padding, section breaks |
| `--space-6` | 32px | Component spacing, group separation |
| `--space-7` | 48px | Major section separation |
| `--space-8` | 64px | Page-level spacing |
| `--space-9` | 96px | Hero spacing, major landmarks |

### Layout Grid

The kitchen uses a responsive layout that adapts without breaking the metaphor.

**Desktop (1024px+):** Two-column layout. The kitchen area (recipe view, card editor, pantry browser) occupies the main column. The sous chef panel occupies a secondary column that can be collapsed. Maximum content width: 1200px, centered.

**Tablet (768px–1023px):** Single-column layout with the sous chef accessible via the chef's hat overlay. The main content area fills the viewport width minus comfortable margins (24px each side).

**Mobile (below 768px):** Full-width single column with 16px margins. The sous chef is accessed through a bottom sheet triggered by the chef's hat. Touch targets are minimum 44×44px.

### Layout Rules

1. **Content never touches the edge of the viewport.** Minimum 16px padding on mobile, 24px on tablet, 32px on desktop.
2. **Cards have generous internal padding** — minimum `--space-5` (24px). Cards should feel spacious, not cramped.
3. **Related elements are grouped by proximity.** Elements within a group use `--space-3` or `--space-4`. Groups are separated by `--space-6` or larger.
4. **Vertical rhythm is maintained** by ensuring all spacing values snap to the 8px grid.
5. **The recipe view reads top to bottom like a document,** not like a diagram. Steps flow vertically with clear visual separation between them.

---

## Components

### Cards (Ingredients)

Cards are the most important visual element in AICard. They must look like physical objects — things you can pick up, move, and arrange — not like flat UI panels.

#### Card Anatomy

```text
┌──────────────────────────────────────┐
│  ┌──┐                               │
│  │🎧│  Listen                        │  ← Card type icon + name (display font)
│  └──┘                               │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  ← Subtle divider
│                                      │
│  Watches for something to happen     │  ← Purpose (body font, --text-secondary)
│  and starts the recipe when it does  │
│                                      │
│  Source: shop order notifications    │  ← Configuration (body font, key in
│  Watch for: new orders               │     --text-tertiary, value in --text-primary)
│                                      │
└──────────────────────────────────────┘
```

#### Card Visual Properties

| Property | Value |
|----------|-------|
| Background | `--surface-light` |
| Border | 1px `--surface-mid` |
| Border radius | 12px |
| Padding | `--space-5` (24px) |
| Shadow (resting) | `0 1px 3px rgba(44, 36, 22, 0.08)` |
| Shadow (hover) | `0 4px 12px rgba(44, 36, 22, 0.12)` |
| Shadow (dragging) | `0 8px 24px rgba(44, 36, 22, 0.16)` |
| Transition | `box-shadow 200ms ease, transform 200ms ease` |

#### Card States

| State | Visual Treatment |
|-------|-----------------|
| **Resting** | Default shadow, full opacity |
| **Hover** | Elevated shadow, slight scale (1.01). Cursor: pointer if clickable |
| **Active / Pressed** | Slightly reduced shadow, scale 0.99. Brief tactile feedback |
| **Dragging** | Maximum shadow, scale 1.03, reduced opacity (0.92). A subtle "lift" effect |
| **Selected** | 2px border in `--accent-primary`, no other change |
| **Running** | Subtle pulse animation on the left border using `--accent-secondary` |
| **Error** | Left border becomes `--status-error`, icon area shows error indicator |
| **Disabled** | Opacity 0.5, no shadow, no hover effects |

#### Card Type Indicators

Each card type in the core pantry has a consistent visual indicator — an icon and a subtle color tint on the card's left edge. This creates instant recognition without requiring the user to read the name.

| Card Type | Left Edge Color | Icon Concept |
|-----------|----------------|--------------|
| Listen | Soft blue `#6A9EC0` | Ear / antenna |
| Wait | Sandy gold `#C4A960` | Hourglass / pause |
| Send Message | Copper `#C17832` | Paper plane / envelope |
| Filter | Sage `#7A9C7A` | Funnel / sieve |
| Summarize | Warm gray `#9C8E78` | Compress / condense |
| Transform | Terracotta `#B8704A` | Mortar & pestle |
| Decide | Slate blue `#6A7F96` | Crossroads / fork |
| Store | Deep brown `#8C6A4A` | Jar / container |

These colors are muted and warm. They must never be so saturated that they compete with the semantic status colors. They are identification, not decoration.

### Recipe View

A recipe displayed in the interface should visually echo its Markdown source — readable, sequential, document-like. It is not a diagram, not a flowchart, not a node graph.

#### Recipe Anatomy

```text
┌─────────────────────────────────────────────────┐
│                                                 │
│  Thank You Follow-Up                            │  ← Recipe name (display font, --text-2xl)
│                                                 │
│  When a new order comes in, wait three days,    │  ← Purpose (body font, --text-md,
│  then send a personalized thank-you message     │     --text-secondary)
│  to the customer.                               │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  KITCHEN                                        │  ← Section label (small-caps, letter-spaced)
│                                                 │
│  ◉ Shop connection — receives new orders        │  ← Equipment items with status dot
│  ◉ Email account — sends messages               │     (green = connected, gray = not)
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  STEPS                                          │
│                                                 │
│  ┌─ 1 ─────────────────────────────────────┐    │
│  │  Listen for a new order                 │    │  ← Step card (indented, numbered)
│  │  Source: shop order notifications       │    │
│  │  Watch for: new orders                  │    │
│  └─────────────────────────────────────────┘    │
│         │                                       │
│         ▼                                       │  ← Flow connector (subtle, vertical)
│  ┌─ 2 ─────────────────────────────────────┐    │
│  │  Wait before following up               │    │
│  │  How long: 3 days                       │    │
│  └─────────────────────────────────────────┘    │
│         │                                       │
│         ▼                                       │
│  ┌─ 3 ─────────────────────────────────────┐    │
│  │  Send a thank-you message               │    │
│  │  To: customer from the order            │    │
│  │  Style: warm, personal, grateful        │    │
│  │  Message idea: thank them for their     │    │
│  │  order, mention what they bought...     │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Flow Connectors

The vertical lines and arrows between steps are subtle — `--surface-mid` color, 1px width, with a small downward-pointing triangle (not an arrowhead) at each connection point. They indicate sequence without dominating the visual hierarchy.

Sub-recipe references look different from card steps: they appear as a compact, single-line element with a link icon, indicating "this is a complete thing that happens elsewhere."

```text
│         ▼
│  ── 4. Acknowledge Receipt ──→               ← Sub-recipe (link-style, single line)
│         │
│         ▼
```

### The Sous Chef

#### Chef's Hat Button

The chef's hat is the sous chef's entry point — always visible, never pushy. It sits in a consistent position (bottom-right on desktop, bottom-center on mobile) and is the most recognizable UI element in AICard.

| Property | Value |
|----------|-------|
| Size | 48×48px (desktop), 56×56px (mobile) |
| Shape | Circle |
| Background | `--accent-primary` (copper) |
| Icon | Chef's hat glyph, `--text-inverse` |
| Shadow | `0 2px 8px rgba(44, 36, 22, 0.2)` |
| Position | Fixed, bottom-right with `--space-5` offset |

**States:**

| State | Behavior |
|-------|----------|
| **Resting** | Solid copper circle with hat icon |
| **Notification** | Small dot indicator (subtle pulse) using `--status-info` |
| **Active (panel open)** | Background shifts to `--accent-primary-hover`, icon rotates to × |
| **Hover** | Slight scale (1.05), elevated shadow |

The chef's hat never bounces, shakes, or draws aggressive attention. It is present, like a sous chef standing quietly at the station.

#### Sous Chef Panel

When the chef's hat is tapped, the sous chef panel appears:

**Desktop:** Slides in from the right as a side panel (320px wide). The main content area compresses to accommodate it. The panel has a `--surface-lightest` background with a left border in `--surface-mid`.

**Mobile:** Rises from the bottom as a sheet (60% viewport height, draggable to expand). Rounded top corners (16px radius). Handle bar at top.

#### Options UI

The sous chef leads with options, not a text field. Options appear as tappable list items:

```text
┌─────────────────────────────────┐
│                                 │
│  What can I help with?          │  ← Sous chef prompt (italic, display font)
│                                 │
│  ┌─────────────────────────┐    │
│  │  Explain what this does │    │  ← Option button
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Change the source      │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Test this step         │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  I want to ask          │    │  ← Always last, opens text input
│  │  something else         │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

Option buttons:

- Background: `--surface-light`
- Border: 1px `--surface-mid`
- Border radius: 8px
- Padding: `--space-3` vertical, `--space-4` horizontal
- Hover: background shifts to `--accent-primary-subtle`
- Active: background `--accent-primary-subtle`, border `--accent-primary`

#### Toast Notifications

Toasts are the sous chef's "tap on the shoulder." They appear at the top of the viewport, slide down gently, and disappear after a set time or on dismissal.

| Property | Value |
|----------|-------|
| Position | Top-center, 16px from viewport top |
| Max width | 480px |
| Background | `--surface-light` |
| Border | 1px `--surface-mid` |
| Left border | 3px in semantic color (info, warning, error) |
| Border radius | 8px |
| Shadow | `0 4px 12px rgba(44, 36, 22, 0.12)` |
| Padding | `--space-4` |
| Animation | Slide down with subtle fade, 300ms ease-out |
| Duration | 6 seconds for info, persistent for errors |

Toasts never stack more than two deep. If a third arrives, the oldest is dismissed.

### Buttons

AICard uses three button tiers. Using more than three tiers creates visual confusion.

#### Primary Button

The main action on any screen. There should only be one primary button visible at a time.

| Property | Value |
|----------|-------|
| Background | `--accent-primary` |
| Text | `--text-inverse`, body font, medium weight |
| Border | none |
| Border radius | 8px |
| Padding | 12px 24px |
| Min height | 44px |
| Hover | `--accent-primary-hover` |
| Active | darken 10%, scale 0.98 |
| Disabled | opacity 0.5, no hover |
| Focus | 2px offset outline in `--accent-primary`, 2px gap |

#### Secondary Button

Supporting actions. Can appear alongside a primary button.

| Property | Value |
|----------|-------|
| Background | transparent |
| Text | `--accent-primary`, body font, medium weight |
| Border | 1.5px `--accent-primary` |
| Border radius | 8px |
| Padding | 12px 24px |
| Min height | 44px |
| Hover | `--accent-primary-subtle` background |
| Active | darken background 5% |

#### Tertiary Button (Text Button)

For low-emphasis actions like "cancel," "skip," "dismiss."

| Property | Value |
|----------|-------|
| Background | transparent |
| Text | `--text-secondary`, body font, regular weight |
| Border | none |
| Padding | 8px 16px |
| Hover | `--text-primary` color, subtle underline |
| Active | `--text-primary` |

### Form Elements

Configuration values within cards are the most frequently used form elements. They must feel like writing, not like filling in a form.

#### Text Input

| Property | Value |
|----------|-------|
| Background | `--surface-lightest` |
| Border | 1.5px `--surface-mid` |
| Border radius | 8px |
| Padding | 12px 16px |
| Font | body font, `--text-base` |
| Text color | `--text-primary` |
| Placeholder | `--text-tertiary`, italic |
| Focus | border color `--accent-primary`, subtle shadow glow |
| Error | border color `--status-error` |

#### Text Area (for message ideas, descriptions)

Same as text input but taller, with `min-height: 80px` and `resize: vertical`. The textarea should grow to fit content up to a reasonable maximum.

#### Select / Dropdown

Follows the same visual treatment as text input — warm background, soft border, rounded corners. The dropdown menu has `--surface-lightest` background with subtle shadow. Selected item has `--accent-primary-subtle` background.

### The Kitchen Counter

The kitchen counter has its own visual identity — slightly different from the structured recipe view. It should feel like a real counter: a surface where things accumulate organically.

| Property | Value |
|----------|-------|
| Background | `--surface-lightest` with a subtle paper-like texture (CSS noise pattern, very faint) |
| Item style | Minimal cards with 1px bottom border, no shadow, compact padding |
| Typography | Body font, slightly smaller (`--text-sm` for metadata) |
| Sections | Separated by a subtle horizontal rule with label (not full-width) |

Counter items don't have the full card treatment. They are lighter, more note-like — closer to sticky notes than to recipe cards. This reinforces that the counter is informal, the space before things become structured.

### Equipment Status Indicators

Equipment items in the kitchen section show connection status:

| Status | Indicator |
|--------|-----------|
| Connected | Filled circle in `--accent-secondary` (green) |
| Not connected | Open circle in `--surface-dark` |
| Error | Filled circle in `--status-error` |
| Connecting | Animated pulse in `--status-info` |

The indicator is a small dot (8px) placed to the left of the equipment label. Status changes are animated with a smooth color transition (300ms).

---

## Iconography

### Design Principles

AICard icons are line-based, warm, and suggestive rather than literal. They should feel hand-drawn without actually being hand-drawn — a subtle organic quality in the line weight and corner treatment.

### Icon Properties

| Property | Value |
|----------|-------|
| Style | Outlined, 1.5px stroke weight |
| Corner radius | Slightly rounded (2px on inner corners) |
| Grid | 24×24px with 2px padding (20×20 active area) |
| Color | Inherits text color by default (`currentColor`) |
| Small variant | 16×16px for inline use |
| Large variant | 32×32px for feature headers |

### Core Icon Set

| Concept | Icon Description |
|---------|-----------------|
| Recipe | Stacked cards with a purpose line |
| Card / Ingredient | Single rounded rectangle |
| Kitchen | Simple house/workspace outline |
| Equipment | Plug / connection symbol |
| Pantry | Shelf with jars |
| Sous Chef | Chef's hat (toque) |
| Chef's Hat button | Toque, filled variant |
| Run / Start | Play triangle, soft corners |
| Pause / Wait | Two vertical bars, hourglass for Wait card |
| Stop | Rounded square |
| Share | Arrow emerging from a card shape |
| Settings | Simple gear, 6 teeth (not 8 — less mechanical) |
| Search | Magnifying glass |
| Add | Plus sign, rounded terminals |
| Remove | Minus sign, rounded terminals |
| Edit | Pencil |
| Success | Checkmark, soft stroke |
| Error | Exclamation in circle |
| Warning | Triangle with exclamation |
| Info | Lowercase "i" in circle |
| Kitchen Counter | Notepad / surface with items |

### Icon Usage Rules

1. **Icons always accompany text in the main interface.** Never icon-only for primary navigation or actions. Tooltips are not a substitute for labels.
2. **The chef's hat is the only icon that stands alone** — it is the one universally recognized element.
3. **Icons never carry semantic meaning by color alone.** Always pair colored icons with text or shape cues for accessibility.
4. **Decorative icons are not used.** Every icon serves a functional purpose.

---

## Motion and Animation

### Philosophy

Motion in AICard is mortar, not decoration — the same role AI plays in the system. It fills the gaps between states, gives feedback, and maintains spatial continuity. It never calls attention to itself.

### Timing

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-instant` | 100ms | `ease-out` | Color changes, opacity shifts |
| `--duration-fast` | 200ms | `ease-out` | Hover effects, small state changes |
| `--duration-normal` | 300ms | `ease-in-out` | Panel slides, card expansion |
| `--duration-slow` | 500ms | `ease-in-out` | Page transitions, major state changes |

### Motion Patterns

**Elevation changes:** Cards lift up on hover and press down on click. The shadow and slight scale change create a tactile quality — these feel like physical objects.

**Panel slides:** The sous chef panel slides in from the right (desktop) or bottom (mobile). The main content adjusts with the same timing. Nothing jumps.

**Toast entrance:** Toasts slide down from above the viewport with a subtle fade-in. Exit is a slide up with fade-out.

**Step progress:** When a recipe is running, the active step has a subtle left-border animation — a gentle pulse in `--accent-secondary` that indicates activity without being distracting.

**Connection indicators:** Equipment status dots transition color smoothly. The "connecting" state uses a slow pulse (2 seconds) rather than a spinner.

### Motion Rules

1. **No motion lasts longer than 500ms.** If something takes longer, break it into steps.
2. **No bouncing, elastic, or spring physics.** AICard's motion is calm and confident.
3. **Reduce motion is respected.** When `prefers-reduced-motion` is set, all animations are replaced with instant state changes. This is not optional.
4. **Nothing moves without the user causing it**, except: toast notifications appearing, the running-step indicator, and equipment status changes. Anything else that moves without user action is a bug.
5. **Motion must be consistent.** If cards lift on hover, all cards lift on hover. If panels slide in, all panels slide in the same direction.

---

## Responsive Behavior

### Breakpoints

| Token | Width | Description |
|-------|-------|-------------|
| `--bp-mobile` | < 768px | Single column, bottom sheets, compact cards |
| `--bp-tablet` | 768px – 1023px | Single column, more spacing, side panels on tap |
| `--bp-desktop` | 1024px – 1439px | Two-column capable, side panel for sous chef |
| `--bp-wide` | 1440px+ | Max-width container, generous margins |

### Responsive Rules

1. **Content readability is the priority at every breakpoint.** If text becomes too small or lines too long, the layout must adapt.
2. **Cards reflow to single column on mobile.** They maintain their full internal padding but stack vertically.
3. **Touch targets are minimum 44×44px on mobile and tablet.** No exceptions.
4. **The recipe view is always a single vertical flow.** It never becomes a side-by-side layout — recipes read top to bottom on every screen size.
5. **The sous chef panel adapts per breakpoint** but the interaction model (chef's hat → options → conversation) is identical everywhere.
6. **Images, icons, and decorative elements scale with the layout.** Nothing remains at a fixed pixel size across breakpoints.

---

## Accessibility

### Standards

AICard meets **WCAG 2.1 AA** as a minimum. This is non-negotiable — the "human first" principle means accessible to every human.

### Requirements

**Color and Contrast:**

- All text meets 4.5:1 contrast ratio against its background (AA level)
- Large text (18px+ or 14px+ bold) meets 3:1
- UI components and graphical objects meet 3:1
- Information is never conveyed by color alone
- Focus indicators are always visible and meet 3:1 contrast

**Keyboard Navigation:**

- All interactive elements are reachable by keyboard (Tab, Shift+Tab)
- Focus order follows visual order
- Custom components implement appropriate ARIA roles and keyboard handlers
- Focus is trapped within modal dialogs and the sous chef panel when open
- Escape closes panels, modals, and dropdowns

**Screen Readers:**

- All images have meaningful alt text or are marked decorative
- Form inputs have associated labels
- Status changes are announced via ARIA live regions
- The sous chef's options are navigable as a list
- Recipe steps are structured as an ordered list
- Card types are announced with their type and purpose

**Motion:**

- `prefers-reduced-motion` is respected throughout
- No content depends on animation to be understood
- No flashing content

**Touch:**

- Minimum 44×44px touch targets
- Adequate spacing between interactive elements (minimum 8px)
- Swipe gestures always have button alternatives

### Accessibility Rules

1. **Test with a screen reader before shipping any new component.** VoiceOver on macOS and NVDA on Windows as minimum.
2. **Test with keyboard-only navigation** for every user flow.
3. **Every color in the palette was chosen with contrast ratios in mind.** Do not introduce new colors without checking contrast.
4. **The sous chef must be equally usable via keyboard, screen reader, and touch.** It is AICard's primary AI interface — if it's not accessible, the tool is not accessible.

---

## Writing Style in the Interface

The interface voice is the sous chef's voice — warm, clear, confident, and never condescending. Every piece of text in the UI is part of the experience.

### Principles

**Speak like a person.** "Your email is connected" not "Email integration configured successfully." "Something went wrong with this step" not "Error: Step execution failed."

**Use kitchen language.** "Your kitchen is ready" not "Setup complete." "This recipe needs a shop connection" not "Missing integration: e-commerce platform."

**Be brief.** Every word earns its place. "Connected" not "Successfully connected and verified." "3 days" not "A waiting period of 3 days."

**Never blame the user.** "This step couldn't find the customer's email" not "You entered an invalid configuration." "The connection to your shop stopped working" not "Authentication failed."

### Specific Patterns

| Context | Do | Don't |
|---------|-----|-------|
| Empty state | "Nothing here yet. Ready to start cooking?" | "No items found." |
| Success | "Done." or "Your recipe is running." | "Operation completed successfully!" |
| Error | "Something went wrong with step 3. Want help fixing it?" | "Error: UnhandledPromiseRejection in CardExecutor" |
| Loading | "Getting things ready..." | "Loading..." |
| Confirmation | "Remove this step from the recipe?" | "Are you sure you want to delete Step 3? This action cannot be undone." |
| Missing equipment | "This recipe needs an email account. Want to set one up?" | "Error: Required integration 'email' not configured." |

### Capitalization

- **Sentence case** for all UI text, labels, buttons, and headings. "Run this recipe" not "Run This Recipe."
- **Title case** only for proper nouns: recipe names, card type names, and "AICard" itself.
- **No ALL CAPS** anywhere in the interface except the section labels in recipe view (KITCHEN, STEPS) which use small-caps with letter-spacing.

### Punctuation

- No periods at the end of labels, buttons, or single-sentence descriptions.
- Periods in multi-sentence descriptions and the sous chef's conversational text.
- No exclamation marks except in genuinely celebratory moments (rare).
- Em dashes for asides and explanations — the same way this document uses them.

---

## File and Naming Conventions

### CSS Custom Properties

All design tokens are CSS custom properties, scoped under a theme class:

```css
[data-theme="light"] {
  --surface-lightest: #FDFAF6;
  --accent-primary: #C17832;
  /* ... */
}

[data-theme="dark"] {
  --surface-lightest: #1C1814;
  --accent-primary: #D4903E;
  /* ... */
}
```

### Component Naming

Components follow a flat, descriptive naming convention:

| Component | CSS Class | File |
|-----------|-----------|------|
| Recipe card (in list) | `.recipe-card` | `recipe-card` |
| Ingredient card | `.ingredient-card` | `ingredient-card` |
| Sous chef panel | `.sous-chef-panel` | `sous-chef-panel` |
| Chef's hat button | `.chefs-hat` | `chefs-hat` |
| Toast notification | `.toast` | `toast` |
| Kitchen counter | `.kitchen-counter` | `kitchen-counter` |
| Equipment indicator | `.equipment-status` | `equipment-status` |

No BEM, no deep nesting, no abbreviations. Names should be readable by someone who has never seen the codebase — the same principle as everything else in AICard.

---

## What This System Does Not Cover

This design system defines the visual language. It does not define:

- **Information architecture** — the full sitemap, navigation structure, or page hierarchy. These should be designed separately based on user journeys.
- **Illustration style** — if AICard uses illustrations (onboarding, empty states, marketing), a separate illustration guide should be created.
- **Marketing and brand guidelines** — external communications, social media, website design. The design system applies to the product interface.
- **Specific component implementations** — this document describes what components look like and how they behave, not their code. Implementation follows from these specs.

---

## Summary of Design Tokens

For quick reference, the complete token set:

```css
/* === Surfaces === */
--surface-lightest: #FDFAF6;
--surface-light: #F5F0E8;
--surface-mid: #E8E0D4;
--surface-dark: #D4C9B8;
--surface-darkest: #8C7E6A;

/* === Text === */
--text-primary: #2C2416;
--text-secondary: #5C5040;
--text-tertiary: #8C7E6A;
--text-inverse: #FDFAF6;

/* === Accent === */
--accent-primary: #C17832;
--accent-primary-hover: #A86528;
--accent-primary-subtle: #F5E6D0;
--accent-secondary: #5B8C5A;
--accent-secondary-hover: #4A7A49;
--accent-secondary-subtle: #E2EDDF;

/* === Status === */
--status-info: #4A7FA5;
--status-warning: #D4943A;
--status-error: #C45D4A;
--status-success: #5B8C5A;

/* === Typography === */
--font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
--font-body: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;

--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-md: 1.125rem;   /* 18px */
--text-lg: 1.25rem;    /* 20px */
--text-xl: 1.5625rem;  /* 25px */
--text-2xl: 2rem;      /* 32px */
--text-3xl: 2.5rem;    /* 40px */

/* === Spacing === */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;

/* === Motion === */
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* === Breakpoints (for reference — used in media queries) === */
/* Mobile: < 768px */
/* Tablet: 768px – 1023px */
/* Desktop: 1024px – 1439px */
/* Wide: 1440px+ */
```

---

*This design system is a living document. It grows as AICard grows. New components, patterns, and guidelines should follow the same principle as everything else: human first, machine second. If a visual decision doesn't pass the kitchen test, it doesn't ship.*
