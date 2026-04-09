# Design System Document: The Monospace Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Living Documentation"**
This design system moves away from the traditional "portfolio as a website" and toward "portfolio as a terminal environment." It is an intentional, text-heavy editorial experience that mimics the clarity of a `man` page or a perfectly formatted `README.md`. 

The system rejects modern UI crutches—there are no cards, no borders, and no buttons. Instead, it relies on high-contrast typographic hierarchy, intentional negative space, and tonal layering to create a premium, developer-centric aesthetic. By constraining the content to a 680px centered column, we create an intimate, readable experience that feels like reading a high-end technical journal.

---

## 2. Colors & Surface Logic
The palette is rooted in a deep, nocturnal base (`#111111`) with high-utility accents that provide semantic meaning without visual clutter.

### The "No-Line" Rule
Sectioning is strictly prohibited from using 1px solid borders. Boundaries must be defined through:
1.  **Vertical Rhythm:** Generous white space between logical sections.
2.  **Tonal Shifts:** Transitioning from `surface` (#131313) to `surface_container_low` (#1C1B1B) to define content blocks.
3.  **Indentation:** Using monospace-aligned indentation (e.g., 2ch or 4ch) to nest information.

### Surface Hierarchy
*   **Background (Base):** `surface` (#131313) - The primary canvas.
*   **Nested Content:** `surface_container_low` (#1C1B1B) - Use for code blocks or "asides."
*   **Emphasis Zones:** `surface_container_high` (#2A2A2A) - Only for momentary highlights or hover-state backgrounds for interactive text.

### Signature Textures
While the system is flat, use a subtle "Terminal Glow" on `primary` (#66D8D2) text. Instead of solid boxes, use `surface_tint` at 5% opacity behind key headers to create a soft, ambient focal point that feels like a phosphor screen.

---

## 3. Typography: The Monospace Grid
Typography is the primary engine of this design system. We use monospace exclusively to reinforce the "developer-first" identity.

| Level | Token | Font | Size | Weight | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Space Grotesk* | 3.5rem | 700 | Large "Hero" impact names (e.g., "jebin2"). |
| **Headline**| `headline-md`| Space Grotesk* | 1.75rem | 500 | Major section starts (e.g., "Projects"). |
| **Title** | `title-md` | Inter* | 1.125rem | 600 | Project names or specific roles. |
| **Body** | `body-lg` | Inter* | 1.0rem | 400 | The primary narrative text. |
| **Label** | `label-sm` | Space Grotesk* | 0.68rem | 500 | Meta-data, timestamps, and tags. |

*\*Note: For this system, "Inter" and "Space Grotesk" are mapped to your monospace fonts (JetBrains Mono / Fira Code) to maintain the "README" aesthetic while keeping the sizing logic.*

---

## 4. Elevation & Depth
In a system without cards or shadows, depth is achieved through **Tonal Layering** and **Color Theory.**

*   **The Layering Principle:** To highlight a specific project or achievement, do not lift it with a shadow. Instead, drop the background of the surrounding elements to `surface_container_lowest` (#0E0E0E) and keep the active element on `surface` (#131313). 
*   **The "Ghost Border" Fallback:** If visual separation is needed for a code snippet, use the `outline_variant` (#3D4948) at **15% opacity**. It should be felt, not seen.
*   **Text Elevation:** 
    *   `primary` (#66D8D2) = High Importance (Active links).
    *   `on_surface` (#E5E2E1) = Standard Information.
    *   `on_surface_variant` (#BCC9C7) = Secondary/Dimmed details.

---

## 5. Components (The "Non-Component" Approach)

### "Buttons" (Interactive Text)
Since buttons are forbidden, all CTAs are "Actionable Text."
*   **Style:** Underlined `primary` (#66D8D2) text.
*   **Hover:** Background shifts to `primary_container` (#20A39E) at 20% opacity with a hard square corner (0px radius).
*   **Indicator:** Prepend an ASCII arrow `->` on hover to signify direction.

### "Chips" (Tags)
Tags should look like bracketed metadata: `[ tag_name ]`.
*   **Color:** `secondary` (#B3C5FF).
*   **Background:** None.
*   **Border:** None.

### Lists & Dividers
*   **The Divider:** Never use a `<hr>`. Use a string of characters (e.g., `// // // //`) or a change in `on_surface_variant` text to signify a break.
*   **List Items:** Use traditional Markdown bullet points `-` or numbers `01.` colored in `tertiary` (#FFB3AF).

### Input Fields (The Terminal Prompt)
*   **Style:** A simple underline using `outline` (#869392).
*   **Focus:** The underline changes to `primary` (#66D8D2) with a blinking block cursor `█`.

---

## 6. Do's and Don'ts

### Do
*   **Do** use 0px border radius for everything. The system is brutal and angular.
*   **Do** rely on `680px` max-width. Large line lengths are the enemy of this aesthetic.
*   **Do** use `tertiary` (#FFB3AF) for "Highlight" moments—like a specific tech stack or a "New" badge.
*   **Do** utilize ASCII art or subtle terminal symbols (`$`, `>`, `_`) to guide the eye.

### Don't
*   **Don't** use shadows. They break the flat, documentation-style immersion.
*   **Don't** use gradients unless they are 100% vertical and extremely subtle (e.g., `surface` to `surface_container_low`).
*   **Don't** use standard "Blue" for links. Use the signature `primary` teal (#66D8D2).
*   **Don't** use icons if a word can suffice. This is a text-first system.