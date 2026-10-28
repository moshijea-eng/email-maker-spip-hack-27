# SPIP Hack Letter Maker — UI/UX Improvement Brief

**Target:** https://spip-hack-email-generator.vercel.app (repo: `spit-hack-email-generator`)
**Goal:** Make the interface friendlier and more streamlined while **retaining every existing function**.
**Note:** This brief is based on the page's text/structure only (no visual review of colours, spacing, or mobile layout). Inspect the current code and rendered UI before changing anything.

---

## Current structure (for reference)

Single page, five numbered sections:

1. **Who is it for?** (recipient type selector)
2. **Recipient** — Addressing style (Named recipient / To Whom It May Concern / Team / Department); Title (Mr., Ms., Mrs., Dr., Prof., Assoc. Prof., Khun, คุณ, ดร., ศ., รศ., ผศ., ท่าน); Full name (EN/TH); Position (EN/TH); Organisation/School (EN/TH); Address (EN/TH, optional, one line per row)
3. **Letter details** — Date; Reference no. (optional, with note: only use if approved/assigned by school or supervising staff); Language (English / ไทย / Both); Watermark (strength); Please reply by; Enclosures
4. **Signatures** — Signatory name (EN/TH); Position; optional second signatory (name EN/TH, position); "Leave an area for the school stamp"
5. **Letter text** — Subject; Body (supports `{{name}} {{org}} {{position}} {{replyBy}}`, blank line = new paragraph); "Save as my template"; "Reset to default"; template status message

**Actions:** "Save PDF to Google Drive" and "Save as PDF / Print" (with print-settings instructions: A4, margins None, headers/footers off).

---

## Hard constraints

- **Do not remove or change any function:** all fields, template variables, Save as my template, Reset to default, Google Drive save (Apps Script + Cloudflare Turnstile), print-to-PDF, bilingual output, watermark, stamp area, second signatory.
- Keep it a single-page tool with no new required clicks or accounts.
- Keep PDF output identical (layout, fonts, A4, margins) unless a change is explicitly a bug fix.
- Test English-only, Thai-only, and Both modes after every change.

---

## Visual direction: SPIP Hack gradient on a white background

The tool is an internal utility, so it should feel like the SPIP Hack brand but stay clean and readable. **Use a white (or near-white) page background and use the brand gradient as an accent, not as a fill.**

**Brand source of truth:** the landing page repo `SpipHack27_LandingPage` (`css/style.css`, `:root` variables). Read the real values for `--grad-brand`, the colour tokens, `--font-display`, `--font-body`, radius and spacing from there and reuse them. Do not invent new colours. The landing page is dark with glass effects; this tool inverts it to light.

Brand colours seen in the landing page's ambient gradients (verify against `:root`):

| Token | Approx. value | Use |
|---|---|---|
| Purple | `#4B3F78` | gradient start, headings accent |
| Magenta | `#C4449A` | gradient middle |
| Orange | `#F2622A` | gradient end |
| Cyan / teal | `#2EE6C8` | primary highlight (links, focus ring, 2027 accent) |
| Red | pure red from the logo | sparing accent only |

The brand gradient is **purple → magenta → orange** (`--grad-brand`).

**Where the gradient goes (accents only):**
- Thin gradient bar or line at the top of the page, and under the title.
- Title text or the "SPIP Hack" wordmark area, using the gradient.
- Selected state of "Who is it for?" cards (1.5px gradient ring, as the landing page's `.frame-grad`).
- Step indicator progress line and the active step.
- Primary action button (gradient fill or gradient ring) and a soft gradient glow on hover.
- Optionally a very faint blurred gradient blob behind the header (opacity about 0.08 to 0.15) so the page doesn't look flat.

**Where it does not go:** the form fields, the letter preview, body text, or the PDF output. The PDF/letter must remain unchanged.

**Surfaces and text:**
- Page background `#FFFFFF` (or `#FAFAFC`), cards white with a hairline border (about `#E6E4EE`) and a soft shadow; rounded corners matching the landing page radius.
- Text near-black with a purple tint (about `#1B1630`), muted text `#6B6784`. Check contrast: at least 4.5:1 for body text, and cyan on white is too light for text, so use cyan only as a focus ring or fill, with dark text on it.
- Reuse the landing page's focus-visible style (cyan outline) and its button hover feel (slight scale, soft glow), adapted for a light background.
- Keep the logo: use the SPIP Hack 2027 logo in the header (`Logos - SPIP HACK 2027` assets; the dark-background logo may need the light-friendly or transparent version).

**Reference for layout inspiration:** the TCAS folio demo website the user mentioned. **Link: _[ADD URL HERE]_.** Review it for card layout, spacing, step flow and how it uses colour on white, then adapt those ideas with the SPIP Hack gradient. Do not copy its code or assets.

---

## Improvements

### 1. Reduce visible form clutter
- **Collapse optional fields** behind small "+ Add" links or collapsible sections: Reference no., Enclosures, Reply-by, Watermark, Address (EN/TH), second signatory. Default view = recipient, date, subject, body.
- **Move Language selector to the top** (next to "Who is it for?"). Show only the fields relevant to the chosen language: hide Thai fields for English, hide English fields for Thai, show all for Both. Preserve any values already typed when toggling (just hide, don't clear).
- **Combine Title + Full name + Position into a compact row/grid** instead of stacked fields.

### 2. Guided flow
- **Sticky step indicator** (Recipient → Details → Signatures → Text) that scrolls to sections. Keep single page.
- **Live A4 preview beside the form** on desktop; a "Preview" toggle on mobile. Must reflect the same output as the PDF.
- **Smart defaults:** date defaults to today; remember last signatory/position/organisation in `localStorage`, with an easy way to clear.

### 3. Clearer "Who is it for?"
- Present as large selectable **cards** with a one-line description and clear selected state.
- Show a brief confirmation when selection changes the template (e.g. "Sponsor template loaded").

### 4. Friendlier wording and guidance
- Shorter intro copy, e.g. "Choose a recipient type to start."
- Use example **placeholders** (e.g. "Khun Somchai Wong").
- Turn template variables into **clickable chips** (`{{name}}`, `{{org}}`, `{{position}}`, `{{replyBy}}`) that insert at the cursor in the Body field.
- Replace the long template status sentence with a small badge: "Using default template" / "Using your template".
- Replace the permanent print-instructions paragraph with a short tip beside the button and a "Show print settings" expandable.
- Keep the reference-number approval note, but as a small helper/tooltip tied to the field.

### 5. Clearer actions
- **Sticky bottom action bar:** primary = "Save PDF to Google Drive", secondary = "Save as PDF / Print".
- **Inline status feedback** for Drive save: "Saving…" → "Saved to Drive ✓" with link; clear error message with retry. Avoid blocking alerts.
- Place "Save as my template" and "Reset to default" next to the Letter text section as secondary actions. **Reset must ask for confirmation or offer undo.**

### 6. Polish and accessibility
- Thai-friendly typography (e.g. Noto Sans Thai), slightly larger line height; keep PDF fonts unchanged unless verified.
- Quiet, inline validation only for essentials (name, organisation, date); no blocking errors.
- Larger tap targets, logical tab order, visible focus outlines, proper `<label>` associations, sufficient colour contrast.
- Responsive layout checked at phone width (~375px), tablet, and desktop.

---

## Suggested implementation order

1. Language-driven field visibility + top placement of Language selector
2. Collapse optional fields + compact recipient row
3. Variable chips + template status badge + reworded helper text
4. Sticky action bar + inline Drive-save feedback + Reset confirmation
5. "Who is it for?" cards
6. Live preview panel + step indicator
7. localStorage defaults, typography, accessibility pass

## Acceptance checklist

- [ ] Every original field and function still works
- [ ] Generated PDF is visually identical to before (EN, TH, Both)
- [ ] Google Drive save and Turnstile flow still work
- [ ] Saved template and Reset to default behave as before
- [ ] Usable on mobile (375px) and desktop
- [ ] Keyboard-navigable; labels and contrast pass basic accessibility checks
- [ ] Work done on a separate branch with small, reviewable commits
