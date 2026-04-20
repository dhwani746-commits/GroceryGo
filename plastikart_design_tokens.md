# PlastiKart — Design Tokens Handoff
> Version 1.0 · MVP · April 2025  
> Hand this file to every AI session building PlastiKart UI. Apply every rule here without exception unless a screen-specific note overrides it.

---

## 1. Icon Library

**Library:** [Lucide Icons](https://lucide.dev)  
**Version:** latest stable (pin to a specific version before build)  
**Import (React):** `import { ShoppingCart, Package } from "lucide-react"`  
**Stroke width:** `1.5` (default) for all icons — never use `2` or bold variants  
**Size scale:** Use only these three sizes

| Size token | px | Usage |
|---|---|---|
| `icon-sm` | 16px | Inline text icons, badges, tags |
| `icon-md` | 20px | Nav items, button icons, form field prefixes |
| `icon-lg` | 24px | Empty state illustrations, standalone CTAs |

**Why Lucide:** Consistent 1.5px stroke weight across all 1000+ icons, tree-shakeable, MIT licensed, React + SVG native. Matches the minimal aesthetic required for PlastiKart.

---

### Icon Map — Customer Screens

| Context | Icon name | Lucide token |
|---|---|---|
| Cart (nav / FAB) | Cart | `ShoppingCart` |
| Cart item count badge | — (number badge, no icon) | — |
| Product catalog | Grid | `LayoutGrid` |
| Category filter | Filter | `SlidersHorizontal` |
| Search | Search | `Search` |
| Product stock — in stock | — (text badge only) | — |
| Product stock — out of stock | Circle slash | `CircleSlash` |
| Quantity decrease | Minus | `Minus` |
| Quantity increase | Plus | `Plus` |
| Remove cart item | Trash | `Trash2` |
| Checkout / proceed | Arrow right | `ArrowRight` |
| Back navigation | Arrow left | `ArrowLeft` |
| User / account | User circle | `UserCircle` |
| Log in | Log in | `LogIn` |
| Log out | Log out | `LogOut` |
| Order confirmed / success | Circle check | `CircleCheck` |
| Order history | Clock | `Clock` |
| Order status — confirmed | Circle dot | `CircleDot` |
| Order status — processing | Loader | `Loader` |
| Order status — shipped | Truck | `Truck` |
| Order status — delivered | Package check | `PackageCheck` |
| Delivery address | Map pin | `MapPin` |
| Promo / discount code | Tag | `Tag` |
| Close / dismiss | X | `X` |
| Expand / accordion open | Chevron down | `ChevronDown` |
| Collapse / accordion close | Chevron up | `ChevronUp` |
| Password visibility toggle | Eye / Eye off | `Eye` / `EyeOff` |
| OTP / verify | Shield check | `ShieldCheck` |
| Resend OTP | Refresh | `RefreshCw` |
| Payment | Credit card | `CreditCard` |
| Email | Mail | `Mail` |
| Phone | Phone | `Phone` |

---

### Icon Map — Admin Screens

| Context | Icon name | Lucide token |
|---|---|---|
| Dashboard / home | Layout dashboard | `LayoutDashboard` |
| Products list | Boxes | `Boxes` |
| Add product | Plus circle | `PlusCircle` |
| Edit product | Pencil | `Pencil` |
| Delete product | Trash | `Trash2` |
| Product image upload | Image plus | `ImagePlus` |
| Visibility toggle — visible | Eye | `Eye` |
| Visibility toggle — hidden | Eye off | `EyeOff` |
| Order queue | List ordered | `ListOrdered` |
| Order status update | Arrow up circle | `ArrowUpCircle` |
| Promo codes | Ticket | `Ticket` |
| Create promo | Plus circle | `PlusCircle` |
| Discount — percentage | Percent | `Percent` |
| Discount — flat rupee | Indian rupee | `IndianRupee` |
| Analytics / revenue | Bar chart | `BarChart3` |
| Expiry date | Calendar | `Calendar` |
| Usage count | Users | `Users` |
| Search orders | Search | `Search` |
| Filter orders | Filter | `Filter` |
| Date range | Calendar range | `CalendarRange` |
| Settings / logout | Settings | `Settings` |

---

## 2. Color Palette

PlastiKart uses a **two-brand-color system** — Primary Blue and Accent Saffron — layered on a neutral gray scale and four semantic status colors.

All hex values are defined for light mode. Dark mode variants are noted where they differ meaningfully (full dark-mode theming is post-V1; flag tokens where inversion is needed).

---

### 2.1 Brand Colors

#### Primary — Trust Blue
The primary action color. Used on all main CTAs, links, active states, and key UI affordances.

| Token | Hex | Usage |
|---|---|---|
| `brand-primary-900` | `#0D2F5C` | Rarely used — deep emphasis text |
| `brand-primary-700` | `#1A5EA8` | Primary button background, strong links |
| `brand-primary-600` | `#2172C7` | Default CTA, active nav underline |
| `brand-primary-500` | `#3A8FE8` | Button hover state, focus rings |
| `brand-primary-200` | `#B3D4F7` | Light badge backgrounds, info tints |
| `brand-primary-50` | `#EBF4FF` | Subtle highlighted sections, info banners |

**Primary button:** bg `brand-primary-600`, hover `brand-primary-500`, text always white  
**Link text:** `brand-primary-600`, hover `brand-primary-500`, no underline by default  

---

#### Accent — Saffron Orange
Used sparingly for promotions, promo code callouts, discount labels, and sale badges. Never use as a primary action color.

| Token | Hex | Usage |
|---|---|---|
| `brand-accent-700` | `#B85A00` | Accent text on light backgrounds |
| `brand-accent-500` | `#F07B00` | Promo badge background, sale label |
| `brand-accent-200` | `#FFD5A0` | Light promo tint, discount highlight |
| `brand-accent-50` | `#FFF4E6` | Promo code input background tint |

**Promo badge:** bg `brand-accent-50`, border `brand-accent-200`, text `brand-accent-700`  
**Discount line in order summary:** text `brand-accent-700`, prefix icon `Tag` in `brand-accent-500`  

---

### 2.2 Neutral Gray Scale

The backbone of the entire UI. All backgrounds, borders, body text, and muted elements live here.

| Token | Hex | Usage |
|---|---|---|
| `neutral-950` | `#0F0F0F` | Never used directly — true black |
| `neutral-900` | `#1A1A1A` | Primary headings (H1, H2) |
| `neutral-700` | `#3D3D3D` | Body text, labels |
| `neutral-500` | `#717171` | Secondary text, placeholder text, muted meta |
| `neutral-400` | `#9E9E9E` | Disabled text, helper hints |
| `neutral-300` | `#C8C8C8` | Input borders (default), dividers |
| `neutral-200` | `#E3E3E3` | Input borders (hover), card borders |
| `neutral-100` | `#F2F2F2` | Chip/tag backgrounds, table header fill |
| `neutral-50` | `#F8F8F8` | Page background, secondary surface |
| `neutral-0` | `#FFFFFF` | Card background, input background, modal |

**Page background:** `neutral-50`  
**Card / sheet background:** `neutral-0`  
**Primary body text:** `neutral-700`  
**Heading text:** `neutral-900`  
**Placeholder / hint text:** `neutral-500`  
**Disabled state text:** `neutral-400`  
**Default input border:** `neutral-300`, focused `brand-primary-500`  
**Dividers / horizontal rules:** `neutral-200`  

---

### 2.3 Semantic Status Colors

Used exclusively for status indicators, alerts, and system feedback. Never repurpose these for decoration.

#### Success — Green
| Token | Hex | Usage |
|---|---|---|
| `status-success-700` | `#1A6B3C` | Success text |
| `status-success-500` | `#28A460` | Success icon color |
| `status-success-100` | `#D4F0E0` | Success banner background |
| `status-success-50` | `#EDFAF3` | Subtle success tint |

**Use for:** Order confirmed, payment success, OTP verified, product saved successfully, "In stock" badge  
**In-stock badge:** bg `status-success-50`, border `status-success-100`, text `status-success-700`

---

#### Warning — Amber
| Token | Hex | Usage |
|---|---|---|
| `status-warning-700` | `#7A4800` | Warning text |
| `status-warning-500` | `#D08000` | Warning icon |
| `status-warning-100` | `#FDEAB0` | Warning banner background |
| `status-warning-50` | `#FEF7DC` | Subtle warning tint |

**Use for:** Out-of-stock item in cart, partial stock ("Only 3 left"), order processing status, expiring promo code  
**Low stock hint:** text `status-warning-700`

---

#### Danger — Red
| Token | Hex | Usage |
|---|---|---|
| `status-danger-700` | `#8B1A1A` | Error text |
| `status-danger-500` | `#D83030` | Error icon, destructive action icon |
| `status-danger-100` | `#FBDADA` | Error banner background |
| `status-danger-50` | `#FEF2F2` | Subtle error tint, inline field error bg |

**Use for:** Payment failed, invalid promo code, form validation errors, delete confirmation  
**Inline field error:** text `status-danger-700`, icon `CircleAlert` in `status-danger-500`

---

#### Info — Blue (alias)
Re-uses the primary brand blue for informational states to keep the palette lean.

| Token | Hex | Alias |
|---|---|---|
| `status-info-700` | `#1A5EA8` | = `brand-primary-700` |
| `status-info-500` | `#2172C7` | = `brand-primary-600` |
| `status-info-50` | `#EBF4FF` | = `brand-primary-50` |

**Use for:** Email notification sent, shipping update banner, order tracking info

---

### 2.4 Surface & Overlay

| Token | Hex | Usage |
|---|---|---|
| `surface-card` | `#FFFFFF` | Product cards, cart items, order cards |
| `surface-page` | `#F8F8F8` | All page backgrounds |
| `surface-modal-overlay` | `rgba(0,0,0,0.45)` | Modal / bottom sheet backdrop |
| `surface-shimmer-base` | `#E8E8E8` | Skeleton loader base color |
| `surface-shimmer-shine` | `#F5F5F5` | Skeleton loader animation highlight |

---

### 2.5 Order Status Badge Colors

These four states must be visually distinct at a glance.

| Status | Background | Border | Text | Icon |
|---|---|---|---|---|
| Confirmed | `brand-primary-50` | `brand-primary-200` | `brand-primary-700` | `CircleDot` |
| Processing | `status-warning-50` | `status-warning-100` | `status-warning-700` | `Loader` (animated spin) |
| Shipped | `brand-accent-50` | `brand-accent-200` | `brand-accent-700` | `Truck` |
| Delivered | `status-success-50` | `status-success-100` | `status-success-700` | `PackageCheck` |

---

## 3. Typography Scale

Font family: **Inter** (primary), fallback `system-ui, -apple-system, sans-serif`  
Load via: `@fontsource/inter` or Google Fonts — weights 400 and 500 only (keep bundle lean)

| Token | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| `text-xs` | 11px | 400 | 1.4 | Micro labels, legal hints |
| `text-sm` | 13px | 400 | 1.5 | Meta text, timestamps, badge labels |
| `text-base` | 15px | 400 | 1.6 | Body copy, form labels, cart items |
| `text-md` | 17px | 500 | 1.5 | Card titles, section headers |
| `text-lg` | 20px | 500 | 1.4 | Page headings (H2 equivalent) |
| `text-xl` | 24px | 500 | 1.3 | Primary page title (H1) |
| `text-price` | 18px | 500 | 1.2 | Product price, order total |
| `text-total` | 22px | 500 | 1.2 | Grand total in checkout |

**Rules:**
- Never go below 11px
- Use weight 500 for headings and emphasis only — never 600 or 700
- Price values always use `text-price` token regardless of context
- Currency symbol (₹) renders at the same size as the number, no superscript

---

## 4. Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon-to-text gap, badge padding |
| `space-2` | 8px | Inline element gaps |
| `space-3` | 12px | Component internal padding (compact) |
| `space-4` | 16px | Standard card padding, form field gap |
| `space-5` | 20px | Section spacing on mobile |
| `space-6` | 24px | Section spacing on desktop, modal padding |
| `space-8` | 32px | Page section breaks |
| `space-12` | 48px | Large vertical breathing room |

| Radius token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, chips, tags, small buttons |
| `radius-md` | 10px | Input fields, secondary buttons |
| `radius-lg` | 14px | Cards, modals, bottom sheets |
| `radius-xl` | 20px | Large featured cards (if used) |
| `radius-full` | 9999px | Pills, avatar circles, FAB |

---

## 5. Component Quick Reference

### Buttons
| Variant | Background | Text | Border | Hover bg |
|---|---|---|---|---|
| Primary | `brand-primary-600` | `#FFFFFF` | none | `brand-primary-500` |
| Secondary | `neutral-0` | `neutral-700` | `neutral-300` | `neutral-100` |
| Destructive | `status-danger-50` | `status-danger-700` | `status-danger-100` | `status-danger-100` |
| Ghost | transparent | `brand-primary-600` | none | `brand-primary-50` |
| Disabled (all) | `neutral-100` | `neutral-400` | none | — |

All buttons: `radius-md`, `text-base` (15px, weight 500), height 44px (mobile tap target minimum)

### Input Fields
- Background: `neutral-0`
- Border: `1px solid neutral-300`
- Focus border: `2px solid brand-primary-500`
- Error border: `1px solid status-danger-500`
- Placeholder text: `neutral-500`
- Height: 48px (form fields), 40px (search / filter fields)
- Radius: `radius-md`

### Stock Badges
| State | Background | Text | Notes |
|---|---|---|---|
| In stock | `status-success-50` | `status-success-700` | No icon; text only |
| Low stock | `status-warning-50` | `status-warning-700` | "Only N left" |
| Out of stock | `neutral-100` | `neutral-500` | Strikethrough price |

---

## 6. Rules for Claude Haiku

When building any PlastiKart screen, apply these rules in every response:

1. **Icons:** Use only Lucide icons from the map above. Stroke width `1.5`, size per the scale. Never substitute emoji or other icon libraries.
2. **Colors:** Reference tokens by name (e.g., `brand-primary-600`). Never introduce new hex values not in this document.
3. **Status colors:** Use the semantic color for its intended meaning only. Never use `status-danger` for decorative red, never use `status-success` for anything that isn't a success state.
4. **Promo / discount:** Always use Saffron accent, never primary blue. The two must be visually distinct so users can tell a promotional element from an action element.
5. **Order status badges:** Always use the four-color badge system from section 2.5. Never use plain text-only status.
6. **Typography:** Stick to the 8-step scale. Price figures always get `text-price`. Grand totals always get `text-total`.
7. **Touch targets:** Every tappable element minimum 44×44px. No exceptions for mobile views.
8. **Empty states:** Every list or grid must have an empty state. Use `neutral-500` text + a relevant Lucide icon at `icon-lg` (24px) in `neutral-300`.
9. **Error states:** Inline field errors use `status-danger-700` text + `CircleAlert` icon. Toast errors use `status-danger-100` background. Never use generic red `#FF0000` or similar.
10. **Admin vs customer:** Admin screens share the same palette but use `LayoutDashboard`, `Boxes`, `ListOrdered`, `Ticket` as primary nav icons. Customer screens lead with `ShoppingCart`, `UserCircle`, `Package`.
