# LOVABLE BUILD PROMPT — Alpine-Eco Notebooks & Diaries Marketing Website

## PROJECT OVERVIEW

Build a premium, single-page marketing website for **Alpine-Eco Notebooks & Diaries** — a South African **printing and book-binding company** that manufactures notebooks, diaries and journals in-house. This is a company/brand site, not an online shop — there is no cart, no checkout, no product pricing. The goal is to explain who they are, what they print, and how they work, and drive enquiries.

Upload the attached logo (blue/green wordmark with an open-book-and-arc mark, "Alpine-eco / Notebooks & Diaries") and use it in the nav and footer.

The site should feel like **premium print-house meets modern tech**: clean white space, generous padding, thin low-opacity borders, editorial serif headings paired with a crisp sans body, and a scroll-driven 3D-style motion layer running behind the content.

---

## TECH STACK

- React + TypeScript
- Tailwind CSS
- Framer Motion for all animation and scroll-driven motion
- **Do NOT use Three.js, WebGL, `<canvas>`, or any 3D rendering library.** The "3D" objects described below must be built as plain styled `<div>` elements using **CSS 3D transforms** (`perspective`, `transform-style: preserve-3d`, `rotateX/Y/Z`, `translateZ`) driven by scroll position. This is a deliberate choice: CSS 3D transforms are natively supported by every browser with no external dependency and no risk of a WebGL context failing to initialize — reliability matters more here than raw visual fidelity. Framer Motion's `useScroll` + `useTransform` hooks are the right tool for wiring scroll position to these transforms.

---

## BRAND & DESIGN SYSTEM

### Colors
- Primary background: white `#FFFFFF` and off-white `#F4F7F2`
- Primary accent — royal blue: `#1B3FBE` (deeper `#122E9A`, lighter `#3D5FD4`)
- Secondary accent — eco green: `#1E9E5E` (lighter `#2ECC8A`)
- Text: deep ink navy `#0D1A2E` (headings), mid navy `#2A3D55` (secondary text), muted blue-gray `#56677C` (body copy — deliberately darker than a typical light gray for contrast/readability)
- A darker green `#177A4A` is used specifically for small uppercase "eyebrow" labels on white, since the brighter green fails contrast at that size/weight
- Borders: 1px, low-opacity royal blue (`#1B3FBE` at ~12–14% opacity)

### Typography
- Headings: **Cormorant Garamond** (serif, editorial), 500–600 weight. Use italic weight for accent words within headings (e.g. one word of a headline in italic royal blue)
- Body/UI: **Inter**, 400–500 weight
- Small labels / eyebrows / nav links / tab headers: 11–13px, uppercase, letter-spacing 0.06–0.16em

### Buttons
- Primary: royal-blue fill, white text, **4px border-radius (not pill-shaped)**, uppercase label, letter-spacing 0.07em, 12px/26px padding
- Ghost/secondary: transparent fill, 1px low-opacity royal-blue border, ink text
- All buttons: subtle `translateY(-2px)` lift + shadow on hover, `scale(0.97)` on press (120ms)

### Cards / surfaces
- 4–8px radius, 1px low-opacity border, minimal/no heavy shadow — flat, print-like
- On hover: a thin gradient underline (royal blue → eco green) animates in from left to right beneath cards/rows (250ms ease)
- Do not use opaque or heavily blurred (`backdrop-filter`) card backgrounds over the 3D motion layer — keep card backgrounds at ~70–75% opacity, no blur, so the motion layer stays visible without sacrificing text legibility. Backdrop blur over continuously-animating content is expensive and should be avoided.

---

## SITE STRUCTURE & COPY

### 1. Nav (fixed/sticky)
- Logo (uploaded image) left
- Links: **Story**, **What We Print**, **How We Work**, **Contact**
- CTA button "Get In Touch" (desktop only, hidden below ~860px)
- Transparent over hero; gains a translucent white background + subtle shadow once scrolled past the hero

### 2. Hero
- Eyebrow: "Alpine-Eco Notebooks & Diaries"
- H1: **"From the press to the *spine*."** ("spine" in italic royal blue)
- Subhead: "Alpine-Eco is a printing and book-binding company. We manufacture notebooks and diaries in-house, from the first printed sheet to the finished, bound cover."
- Two buttons: "What We Print" (scrolls to Offerings), "Our Story" (scrolls to Story)
- Background: a diagonal off-white clipped panel on the right ~52% of the section, plus a faint dot-grid texture

### 3. Story
- Eyebrow: "Our Story"
- H2: **"A print shop, *first* and foremost."**
- Body: "Alpine-Eco is a printing and book-binding company. We manufacture notebooks, diaries and journals in-house — printed on our own presses, cut, and bound under one roof." / "That's the whole business: precision printing and proper binding, done at scale, for brands and individuals who need it done right."
- Bulleted list: "Printed and bound entirely in-house, start to finish" / "Every run checked by hand before it ships" / "Trusted by offices, schools and studios across South Africa"

### 4. What We Print (offerings — informational, not a shop)
- Eyebrow: "What We Print"
- H2: "Notebooks, diaries — and anything in between."
- Subhead: "We manufacture paper goods across four areas — from a single notebook to a branded print run for an entire office."
- 4-column card grid (no numbering — these aren't a sequence):
  - **Notebooks** — "Soft and hard cover, ruled or dot-grid, sized for a desk drawer or a bag."
  - **Diaries** — "Daily and weekly planners with dated pages, built for a year of real use."
  - **Journals** — "Unlined pages for the people who think better with a pen in hand."
  - **Corporate & Custom** — "Branded diaries and notebooks for teams, clients and year-end gifting."

### 5. How We Work (a genuine 4-step process — numbering IS appropriate here)
- Eyebrow: "How We Work"
- H2: "From plates to pages, bound by hand."
- Subhead: "Alpine-Eco isn't just a notebook brand — we run the press and the bindery ourselves. That means tighter quality control, faster turnaround, and the flexibility to do genuinely custom runs."
- 4-step horizontal process row, each with a number (01–04), a simple line icon, title, description:
  1. **Print** — "Litho and digital printing, run in-house for full control over quality and colour."
  2. **Cut** — "Every sheet trimmed and squared to size before it goes anywhere near a binder."
  3. **Bind** — "Perfect, saddle-stitch or casebound — whatever the job calls for."
  4. **Finish & Check** — "Every run checked by hand before it ships — no shortcuts, no guesswork."
- A thin gradient line (royal blue → eco green) connects the four steps on desktop

### 6. CTA
- Eyebrow: "Get In Touch"
- H2: "Got a print or binding job in mind?"
- Subhead: "Get in touch for stockist information, bulk orders or a custom print and binding quote."
- Button: "Contact Alpine-Eco"

### 7. Footer
- Logo mark (styled text is fine: "Alpine-*eco*" with "eco" in italic green) + tagline: "A printing and book-binding company — we manufacture notebooks and diaries in-house, from press to spine."
- Link columns: Explore (Story / What We Print / How We Work), Contact (email, "Stockists & bulk orders")
- Bottom bar: copyright, "Made in South Africa"

---

## THE 3D MOTION LAYER

A single fixed, full-viewport container sits behind all page content (`z-index` below the nav/content, `pointer-events: none`), holding **three CSS-3D objects** that cross-fade and reposition as the user scrolls. Only one is ever meaningfully visible at a time.

### Backdrop (behind everything, pure CSS, no images/canvas)
- A halftone dot pattern: two overlapping `radial-gradient` dot grids (one royal-blue, one eco-green, offset from each other) at low opacity, masked so it fades out toward the edges — evokes an offset-printing halftone screen
- A cutting-mat grid texture: `repeating-linear-gradient` in both directions, very low opacity blue lines on off-white — evokes a print-shop cutting table

### Object 1 — The Book (visible during Hero)
- Two hinged rectangular "cover" panels (one royal blue, one eco green gradient) meeting at a central dark spine, each with 1–2 layered "page" divs (cream/off-white) slightly inset, using `translateZ` for depth
- A small eco-green ribbon/bookmark element hanging from the spine
- As the user scrolls through the hero, each cover panel rotates on its own `transform-origin` (the spine edge) from a near-closed angle (~70°) down to a shallow open angle (~8°) via `rotateY()` — a literal opening-book effect
- Fades in quickly at the very top of the hero scroll

### Object 2 — Cascading Sheets (visible during Story / What We Print)
- 4 independent rectangle "sheet" divs (off-white/cream), each scattered at different `translate3d` offsets and `rotate3d` angles, layered at different Z depths, with soft drop shadows
- A faint ruled-line pattern on each sheet (subtle horizontal lines) to read as paper
- Slowly rotates as a group while scrolling through Story and What We Print; cross-fades in as the Book fades out, and cross-fades out before How We Work begins

### Object 3 — Binding Detail (visible during How We Work)
- 3 stacked, slightly rotated rectangular "plate" divs in blue/green/cream suggesting a small pile of bound books
- 3 small thread-like arc shapes (a border-radius trick or small SVG) in eco-green positioned along a shared centerline to suggest binding stitches
- Cross-fades in as Cascading Sheets fades out; fades out before the footer

### Positioning rule
Whichever object is active should sit offset to the side opposite whatever text column is next to it in that section (e.g. shifted right during the hero since hero text is on the left), so the 3D object never renders directly behind — and doesn't fight for legibility with — the text. Compute this via a simple side-offset transform on each object's container, not by making cards opaque.

### Reduced motion
Respect `prefers-reduced-motion`: skip continuous idle rotation and drive updates only from scroll/resize events rather than a continuous animation loop.

### Robustness requirement
This motion layer is a progressive enhancement. If any part of the scroll-tracking logic throws an error, the page must continue to work normally — wrap the scroll-update logic so a single failed frame cannot permanently stop the animation loop, and ensure the page is fully readable and functional with the 3D layer hidden entirely.

---

## ANIMATIONS & TRANSITIONS (2D content)

- Text/element reveals: fade + rise 8px on scroll into view (Framer Motion `whileInView`, threshold ~15%, stagger ~60ms within a group) — restrained, no bounce
- Nav: cross-fades to a translucent background once scrolled past the hero
- Tabs/underlines: any active-state indicator slides rather than snapping
- Cards: gradient-underline hover as described above
- Buttons: lift on hover, scale-down on press
- Keep all motion quiet and premium — ease-out/ease-in-out only, no overshoot or playful bounce

---

## RESPONSIVE

- Nav links collapse below ~860px (keep logo + a menu affordance)
- Section grids (offerings, process steps) go to 2 columns then 1 column on smaller screens
- The 3D layer's objects should scale down proportionally on mobile rather than being cropped

---

## DELIVERABLES

1. Fully responsive single-page site matching the structure and copy above
2. Working scroll-driven CSS-3D motion layer (Book → Sheets → Binding Detail) with no external 3D/animation dependency beyond Framer Motion
3. Logo integrated in nav and footer
4. All copy as written above — do not add sustainability/eco-sourcing claims or invented certifications; this is a printing/manufacturing story, not an environmental one
5. Contact button wired to a mailto link or a simple contact section (no backend required for v1)
