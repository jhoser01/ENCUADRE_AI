# ENCUADRE — Design Workflow (Stitch & Figma)

## 1. Google Stitch MCP Project

- **Project ID**: `931707746720943674`
- **Design System Asset**: `ab263ce102924865910b23d555dfdbe7` ("Encuadre Studio")
- **Generated Screens**:
  - `f3d2ac43078f4a5499e2d54a8541cdcc`: Studio Dashboard (Desktop)
  - `9b740510fc2b4041a7d66be851b9e38d`: Alignment Score & Diagnostics (Desktop)
  - `4d35e165485444b68bbbc501e51ea009`: Client Pairwise A/B Selection (Mobile)
  - `29f03222839943fe8d601cf9fbcfe39e`: Client Welcome & Onboarding (Mobile)
  - `82c97a8eec1c4e979a0ebf35f2a1ecf3`: Visual Brief Dual Approval (Mobile)

---

## 2. Design Tokens Mapping

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `ink-950` | `#080714` | Main dark background for Studio |
| `ink-900` | `#100A2E` | Card & surface containers |
| `purple-500` | `#7C3DFF` | Primary action color & gradient start |
| `green-600` | `#16C95A` | Success, alignment confirmed |
| `green-400` | `#45E679` | Highlights & gradient end |
| `brand-gradient` | `linear-gradient(135deg, #7C3DFF 0%, #45E679 100%)` | Special CTAs, score rings, badges |
| `surface-50` | `#F7F7FB` | Client mobile background |
| `surface-100` | `#EEEEF5` | Client card borders and dividers |
| `text-muted-dark` | `#A9A7B7` | Subtext in Studio dark mode |
| `text-muted-light`| `#626171` | Subtext in Client light mode |

---

## 3. Typography Hierarchy

- **Brand & Headings**: Poppins (500, 600, 700, 800)
- **Product UI & Body**: Geist / Inter (300, 400, 500, 600)
- **Base Spacing**: 4px grid system
- **Radius**: Cards (16px), Buttons/Inputs (8px-12px), Badges (999px pill)
