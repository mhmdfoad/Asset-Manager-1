# Headless WooCommerce eCommerce Store — Technical Architecture & Implementation Plan

> Production-ready commercial project plan. Arabic-first, RTL-first, scalable, secure, and performant.

---

## 1. System Concept Overview

This project is a **headless eCommerce system** where the frontend and backend are fully decoupled:

- **WordPress + WooCommerce** acts as the backend engine. It owns all business logic: products, categories, inventory, orders, customers, coupons, taxes, shipping, payment gateways, and transactional emails. No customer ever sees WordPress directly.
- **Next.js** acts as the storefront. It fetches data from WooCommerce through secure REST and GraphQL APIs, renders pages server-side or statically, handles cart state, authentication flows, and provides the entire shopping experience.
- **A custom WordPress plugin** ("Storefront Controller") acts as a bridge — exposing frontend configuration settings (colors, fonts, logo, homepage sections, SEO defaults, checkout return URLs, social links) through a dedicated REST endpoint, so the store owner can control the Next.js frontend's look and behavior from the WordPress admin without touching code.

**Why headless?**
- Full control over UI/UX without WordPress/WooCommerce theme limitations
- Faster performance using Next.js SSG/SSR with edge caching
- Native RTL/Arabic-first experience (not patched on top of a theme)
- Independent deployment and scaling of frontend and backend
- Future-proof: swap backend or frontend independently

---

## 2. Best Architecture for Connecting Next.js with WooCommerce

### Communication Layers

```
Customer Browser
      │
      ▼
Next.js (Vercel / Nginx)
      │  ├── WooCommerce REST API v3  →  Products, Orders, Customers, Coupons
      │  ├── WooCommerce Store API    →  Cart, Checkout (block-based)
      │  ├── WPGraphQL + WooGraphQL   →  Rich product/category queries (optional, faster)
      │  └── Custom Plugin REST API   →  Frontend configuration settings
      │
      ▼
WordPress + WooCommerce (VPS / managed WP host)
      │
      ▼
MySQL Database
```

### Recommended API Strategy

| Use Case | API |
|---|---|
| Product listings, categories, search | WooCommerce REST API v3 or WooGraphQL |
| Single product, variations, attributes | WooCommerce REST API v3 |
| Cart management | WooCommerce Store API (CoCart or native block-cart) |
| Checkout creation | WooCommerce REST API v3 (create order + get payment URL) |
| Customer login / registration | WordPress REST API + WooCommerce Customer endpoints |
| Order history | WooCommerce REST API v3 (authenticated) |
| Frontend settings (colors, fonts, etc.) | Custom Plugin REST endpoint |
| Webhooks (order status changes) | WooCommerce Webhooks → Next.js API Route |

### Authentication Strategy

- **Store-to-store calls** (server-side Next.js): Consumer Key + Consumer Secret via HTTPS headers
- **Customer-facing calls**: JWT tokens issued by WordPress (using the JWT Authentication for WP REST API plugin)
- **Admin plugin config endpoint**: Protected by WordPress nonce + admin capability check

---

## 3. What Next.js Handles

- All customer-facing UI: home, catalog, search, product pages, cart, checkout, account
- Routing and navigation (Arabic `/` default, English `/en/` prefix)
- RTL/LTR switching based on locale
- Cart state management (client-side, synced with WooCommerce Store API)
- Guest and authenticated checkout flows
- Customer account pages (login, register, dashboard, orders, addresses)
- Displaying WooCommerce order payment redirect
- Handling post-payment return URLs (success, failure, pending)
- Receiving and processing WooCommerce webhooks (order status updates)
- SEO (meta tags, Open Graph, structured data, sitemaps)
- Performance: image optimization, lazy loading, code splitting
- Frontend configuration rendering (from Custom Plugin API)
- Coupon code entry and validation
- Shipping method selection and display
- Tax display (fetched from WooCommerce)

---

## 4. What Stays Inside WordPress and WooCommerce

- Product and inventory management
- Category and attribute management
- Pricing, sale prices, and scheduled promotions
- Stock levels and low-stock alerts
- Order lifecycle management (new → processing → shipped → complete)
- Customer account data (addresses, purchase history)
- Coupon rules, usage limits, and expiry
- Shipping zones, methods, and rates
- Tax rules by region
- Payment gateway configuration (Stripe, PayPal, local gateways like Moyasar, HyperPay, Tap)
- Transactional email templates (order confirmation, shipping, etc.)
- WooCommerce Webhooks configuration
- Roles, permissions, and admin access
- All plugin and extension management

---

## 5. Custom WordPress Plugin — "Storefront Controller"

### Purpose

Gives the store owner a simple WordPress admin UI to control the Next.js frontend without touching code.

### Admin UI Sections

- **Branding**: Logo URL, favicon, store name, tagline (AR + EN)
- **Colors**: Primary, secondary, accent, background, text — with color picker
- **Typography**: Font family selection, font weights, base font size
- **Homepage Sections**: Toggle sections on/off (hero, featured products, categories, banners, testimonials), reorder them, set content per section
- **Navigation Menus**: Define header/footer navigation links (AR + EN labels)
- **Social Links**: Instagram, Twitter/X, TikTok, Facebook, YouTube, WhatsApp
- **SEO Defaults**: Default meta title pattern, meta description, OG image
- **Checkout Settings**: Return URL for successful payment, failed payment URL, order pending URL
- **Announcement Bar**: Text, link, visibility toggle
- **Maintenance Mode**: Toggle + message

### API Endpoint

```
GET /wp-json/storefront/v1/config
```

Returns all configuration as a single JSON object. Next.js fetches this on build (for static content) and via ISR (revalidate every 60 seconds) so changes take effect without a full redeploy.

The endpoint is **public read-only** (no sensitive data) and **protected from writes** by WordPress admin capability.

### Plugin Folder Structure

```
storefront-controller/
├── storefront-controller.php          # Plugin header, init hooks
├── includes/
│   ├── class-admin-settings.php       # WordPress admin UI pages
│   ├── class-rest-api.php             # REST endpoint registration and handler
│   ├── class-settings-schema.php      # Default values and validation rules
│   └── class-sanitizer.php            # Input sanitization helpers
├── admin/
│   ├── views/
│   │   ├── page-general.php           # Branding & colors tab
│   │   ├── page-homepage.php          # Homepage sections tab
│   │   ├── page-seo.php               # SEO defaults tab
│   │   └── page-checkout.php          # Checkout return URLs tab
│   └── assets/
│       ├── admin.css
│       └── admin.js                   # Color pickers, drag-and-drop section ordering
└── README.md
```

---

## 6. Arabic RTL as Default + English LTR Support

### Next.js Internationalization (i18n) Setup

```
Default locale: ar        → served at /
Second locale: en         → served at /en/
```

Use Next.js built-in `i18n` config in `next.config.js`:
- `defaultLocale: 'ar'`
- `locales: ['ar', 'en']`

### RTL/LTR Implementation

- The `<html>` element gets `dir="rtl" lang="ar"` for Arabic and `dir="ltr" lang="en"` for English
- CSS uses **logical properties** throughout (e.g., `margin-inline-start` instead of `margin-left`) — this is the correct modern approach, no RTL hacks
- Tailwind CSS configured with `dir` variant support (using `tailwindcss-rtl` or Tailwind v3+ logical utilities)
- Font loading: Arabic pages load an Arabic font (e.g., Noto Kufi Arabic, Cairo, or Tajawal); English pages load a Latin font (e.g., Inter or DM Sans)
- Icons and directional UI elements (arrows, chevrons, carousels) flip automatically via CSS logical properties or conditional classes

### Translation Management

- Use `next-intl` or `next-i18next` for string translations
- Translations stored in `/locales/ar.json` and `/locales/en.json`
- WooCommerce content (product names, descriptions, categories) must be translated using **WPML** or **Polylang** on the WordPress side — each locale fetches from the corresponding WPML language API endpoint

### Arabic-Specific Considerations

- Arabic numerals vs. Eastern Arabic numerals: use standard Western numerals for prices and quantities (universal in eCommerce context)
- Date formatting: use `Intl.DateTimeFormat` with `ar-SA` or `ar-EG` locale as appropriate
- Phone number input: support `+966`, `+971`, `+20` etc. formats
- Payment gateways: ensure chosen gateways support Arabic-language checkout (Moyasar, Tap Payments, and HyperPay all support AR)

---

## 7. Products and Categories

### Product Listing

- Next.js fetches product lists from WooCommerce REST API: `GET /wp-json/wc/v3/products`
- Supports pagination, filtering by category, price range, attributes, and sorting
- Category tree: `GET /wp-json/wc/v3/products/categories` (fetched at build time for static sidebar/menu)
- Use Incremental Static Regeneration (ISR) for product listing pages — revalidate every 60–120 seconds

### Category Pages

- Each category slug generates a static page via `getStaticPaths` + `getStaticProps`
- Category images, descriptions, and parent/child relationships all come from WooCommerce
- Breadcrumb data derived from category hierarchy

### Search

- Use WooCommerce's built-in product search (`?search=...`) for simple search
- For advanced search: integrate **Algolia** or **MeiliSearch** (synced from WooCommerce via webhook or plugin) for instant, typo-tolerant, faceted search

---

## 8. Product Variations

### How WooCommerce Variations Work

WooCommerce products can be:
- **Simple** — one SKU, one price
- **Variable** — has attributes (e.g., Color, Size) and one or more variations (each variation = unique SKU, price, stock, image)

### Next.js Handling

- On the product page, fetch the product object including all defined attributes and available variations
- Render attribute selectors (dropdowns or swatches) for each attribute
- On attribute change: match selected combination against the variations array client-side
- Update displayed price, stock status, SKU, and image based on matched variation
- Pass the matched `variation_id` (not `product_id`) to the Add to Cart call
- Out-of-stock variations are visually disabled with clear messaging

### WooCommerce API Call

```
GET /wp-json/wc/v3/products/{id}/variations
```

Returns all variations with their attribute combinations. Fetch on product page load (server-side), then handle selection logic client-side — no additional API call needed on attribute change.

---

## 9. Cart Management

### Recommended Approach: WooCommerce Store API (CoCart or Native Block Cart)

Do not use the legacy session-based WooCommerce cart for a headless setup — it is tied to PHP sessions and cookies and does not work cleanly with Next.js.

**Option A (Recommended): CoCart Plugin**
- Provides a clean REST API for cart management
- Supports guest carts (using a cart key stored in a cookie or localStorage) and authenticated carts
- Endpoints: add item, update quantity, remove item, apply coupon, calculate shipping, get cart totals

**Option B: WooCommerce Store API (native, block-based)**
- Built into WooCommerce 8+
- Uses a `cart-token` (Nonce-based, set in HTTP header) to identify guest carts
- Less mature for headless but improving rapidly

### Cart State in Next.js

- Cart data lives in **React Context** (or Zustand store), hydrated from the WooCommerce cart API on page load
- Cart key/token stored in a **secure HTTP-only cookie** (server-set via Next.js API route)
- On every cart mutation (add, remove, update), sync with the API and update local state
- Cart item count displayed in the header updates optimistically

### Coupon Application

- User enters coupon code in cart view
- Next.js calls CoCart's apply coupon endpoint
- Response includes updated totals with discount applied
- Error messages (invalid code, expired, minimum order not met) displayed inline

---

## 10. Checkout and Payment

### Checkout Flow

```
Cart Page
  → Shipping Address (collected in Next.js form)
  → Shipping Method Selection (fetched from WooCommerce for entered address)
  → Order Summary + Coupon
  → Payment Method Selection (rendered in Next.js)
  → Place Order → Create WooCommerce Order via API
  → Redirect to payment gateway (or handle on-page if gateway supports it)
```

### Payment Gateway Options

| Gateway | Region | Integration Type |
|---|---|---|
| Stripe | Global | On-page (Stripe Elements) or redirect |
| Moyasar | Saudi Arabia | Redirect or on-page (Moyasar.js) |
| Tap Payments | GCC | Redirect |
| HyperPay | GCC + Egypt | Redirect |
| PayPal | Global | Redirect |
| Cash on Delivery | Anywhere | No redirect needed |

### Guest vs. Authenticated Checkout

- **Guest**: Collects email + shipping details, creates order with billing/shipping data, no WooCommerce account required
- **Authenticated**: Pre-fills saved addresses from the customer's WooCommerce account, links order to account

---

## 11. Creating a WooCommerce Order from Next.js and Redirecting to Payment

### Step-by-Step Flow

1. Customer fills in checkout form in Next.js
2. Next.js sends a **server-side** `POST /wp-json/wc/v3/orders` request (using Consumer Key + Secret, never exposed to the browser) with:
   - Line items (product IDs, variation IDs, quantities)
   - Billing and shipping addresses
   - Shipping method chosen
   - Coupon codes applied
   - Payment method ID (e.g., `moyasar`, `stripe`, `cod`)
   - Customer note (optional)
3. WooCommerce creates the order, returns `order.id` and `order.payment_url`
4. Next.js API route returns the `payment_url` to the client
5. Client browser is redirected to `payment_url` (the WooCommerce checkout payment page for that order)
6. Customer completes payment on the gateway
7. Gateway redirects back to WooCommerce, which processes the payment and redirects to the configured return URL

### Why Server-Side Order Creation?

- Consumer Key + Secret are never sent to the browser
- Prevents price manipulation (prices come from WooCommerce server-side, not from the client)
- Allows server-side validation before order is created

---

## 12. Payment Success, Failed Payment, and Order Status Updates

### Return URLs (Configured in Custom Plugin)

| Outcome | Redirect |
|---|---|
| Payment success | `https://store.com/order/success?order_id={id}&key={key}` |
| Payment failed | `https://store.com/order/failed?order_id={id}` |
| Order pending (awaiting payment) | `https://store.com/order/pending?order_id={id}` |

These URLs are Next.js pages. On load, the page calls a Next.js API route, which verifies the order status by calling:
```
GET /wp-json/wc/v3/orders/{id}?consumer_key=...&consumer_secret=...
```
This server-side verification confirms the actual order status (never trust a URL parameter alone).

### Webhook-Based Order Status Updates

Configure WooCommerce webhooks for:
- `order.updated` — triggers whenever order status changes
- `order.completed`
- `order.refunded`

Each webhook fires a `POST` to a Next.js API route (e.g., `/api/webhooks/woocommerce`). That route:
1. Validates the webhook signature (using the `X-WC-Webhook-Signature` header + shared secret)
2. Processes the event (update internal cache, trigger email, update order display)
3. Returns HTTP 200 immediately (WooCommerce retries if it gets a timeout)

Use a **queue** (Redis + Bull, or a simple database table) to process webhook events asynchronously — never do heavy processing in the webhook response.

---

## 13. Customer Accounts, Login, Registration, and Order History

### Authentication

- Use **JWT Authentication for WP REST API** plugin on WordPress
- Customer logs in via Next.js form → Next.js API route calls `POST /wp-json/jwt-auth/v1/token` → receives JWT
- JWT stored in an **HTTP-only, secure, SameSite=strict cookie** (set by the Next.js API route — never in localStorage)
- All subsequent authenticated API calls include `Authorization: Bearer {token}` header (server-side, not exposed to browser)

### Registration

- Customer fills registration form in Next.js
- Next.js API route calls `POST /wp-json/wc/v3/customers` to create the WooCommerce customer
- On success, automatically log in and issue JWT

### Customer Account Pages

| Page | Data Source |
|---|---|
| Dashboard | Greeting, recent orders summary |
| Orders | `GET /wp-json/wc/v3/orders?customer={id}` |
| Order Detail | `GET /wp-json/wc/v3/orders/{id}` |
| Addresses | `GET /wp-json/wc/v3/customers/{id}` |
| Edit Profile | `PUT /wp-json/wc/v3/customers/{id}` |
| Change Password | `PUT /wp-json/wc/v3/customers/{id}` |

### Password Reset

- "Forgot password" triggers `POST /wp-json/bdpwr/v1/reset-password` (using the "WP REST Password Reset" plugin) — sends WooCommerce's existing password reset email
- Link in email leads to a Next.js password reset page that completes the flow via API

---

## 14. Security Practices

### API Security

- Consumer Key + Consumer Secret stored in **server-side environment variables only** — never in client-side code or browser
- All WooCommerce REST calls made from Next.js API Routes or `getServerSideProps` / `getStaticProps`, never from client components
- HTTPS enforced everywhere (WordPress, Next.js, and all API calls)
- WordPress REST API restricted: disable all unauthenticated write endpoints not explicitly needed
- Rate limiting applied to Next.js API routes (using `rate-limiter-flexible` or Vercel's edge rate limiting)

### WordPress Hardening

- WooCommerce Secret Key used to validate webhook signatures
- Disable the WordPress XML-RPC interface
- Limit login attempts on the WordPress admin (via plugin or server-level)
- Keep WordPress, WooCommerce, and all plugins updated
- Do not install unnecessary plugins (attack surface)
- WordPress admin login URL changed from `/wp-admin` to a custom path
- WordPress health check and security audit tools monitored

### Customer Data Security

- JWT tokens are short-lived (1 hour) with refresh token support
- HTTP-only cookies prevent XSS token theft
- Checkout form uses HTTPS — no sensitive data logged
- PCI compliance: card data never touches your servers — always handled by the payment gateway (Stripe, Moyasar, etc.)
- Input sanitization on all Next.js API routes before passing to WooCommerce
- CSRF protection on all state-changing Next.js API routes

### Content Security

- Content Security Policy headers set on Next.js responses
- CORS configured on WordPress to allow only the Next.js domain
- SQL injection is not a risk (WooCommerce handles all DB queries), but still validate/sanitize all inputs

---

## 15. Caching and Performance Strategy

### Next.js Rendering Strategy

| Page Type | Strategy | Revalidation |
|---|---|---|
| Homepage | ISR | 60 seconds |
| Category listing | ISR | 60 seconds |
| Product page | ISR | 30 seconds |
| Blog/content pages | ISR | 300 seconds |
| Cart, Checkout | CSR only | Real-time |
| Order confirmation | SSR | Per request |
| Account pages | SSR | Per request |
| Frontend config (plugin) | ISR | 60 seconds |

### CDN and Edge Caching

- Deploy Next.js on **Vercel** (built-in global CDN, ISR support, edge functions)
- Static assets (images, fonts, JS, CSS) served from CDN with long cache-control headers
- WooCommerce product images served through Next.js Image Optimization (converted to WebP, resized per viewport)
- Alternatively: **Cloudflare** in front of both Next.js and WordPress for additional DDoS protection and edge caching

### WordPress Performance

- Use a WordPress caching plugin (WP Rocket, LiteSpeed Cache, or W3 Total Cache)
- WordPress REST API responses cached at the server level (Nginx FastCGI cache or Redis Object Cache)
- Database queries optimized via Redis Object Cache plugin
- WordPress hosted on a fast server with PHP 8.2+, MySQL 8, and enough RAM for Redis

### Image Optimization

- All product images go through Next.js `<Image>` component (automatic WebP conversion, lazy loading, responsive sizes)
- Set WooCommerce to store original images and let Next.js handle resizing
- Use Cloudflare Images or imgix as an alternative for very large catalogs

---

## 16. SEO Strategy

### Technical SEO

- All product, category, and content pages are server-rendered (ISR) — fully crawlable by search engines
- Every page has unique, localized `<title>`, `<meta name="description">`, and Open Graph tags (Arabic defaults, English for `/en/` routes)
- Structured data (JSON-LD) for:
  - Product (price, availability, reviews, images)
  - BreadcrumbList
  - Organization
  - WebSite with SearchAction
- Canonical URLs set correctly, including language alternates (`hreflang`)
- `hreflang` tags: `ar` → `/`, `en` → `/en/`, `x-default` → `/`
- XML sitemaps: generated by Next.js (using `next-sitemap`) covering products, categories, and content pages in both languages
- Robots.txt: block `/api/`, `/account/`, `/cart`, `/checkout`

### On-Page SEO

- Product names and descriptions sourced from WooCommerce (multilingual via WPML)
- Category descriptions included on category pages
- URL structure: clean slugs, no query strings for navigating products
- Arabic URLs use Arabic slugs (WooCommerce supports Unicode slugs)
- Page speed: Core Web Vitals optimized by design (ISR, image optimization, minimal JS)

### SEO Defaults from Custom Plugin

- Plugin exposes default meta title suffix, default OG image, and default meta description
- Next.js uses these as fallbacks when product/category-specific meta is not available

---

## 17. Suggested Next.js Folder Structure

```
/
├── app/                              # Next.js App Router (or pages/ if using Pages Router)
│   ├── [locale]/                     # Locale-aware routes (ar = default, en = /en/)
│   │   ├── layout.tsx                # Root layout with dir, lang, font loading
│   │   ├── page.tsx                  # Homepage
│   │   ├── shop/
│   │   │   ├── page.tsx              # All products / shop landing
│   │   │   └── [category]/
│   │   │       └── page.tsx          # Category listing page
│   │   ├── product/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Single product page
│   │   ├── cart/
│   │   │   └── page.tsx              # Cart page
│   │   ├── checkout/
│   │   │   └── page.tsx              # Checkout form
│   │   ├── order/
│   │   │   ├── success/page.tsx      # Order success
│   │   │   ├── failed/page.tsx       # Payment failed
│   │   │   └── pending/page.tsx      # Order pending
│   │   ├── account/
│   │   │   ├── layout.tsx            # Account shell layout
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Orders list
│   │   │   │   └── [id]/page.tsx     # Order detail
│   │   │   ├── addresses/page.tsx    # Saved addresses
│   │   │   └── profile/page.tsx      # Edit profile
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── search/page.tsx
│   └── api/                          # Next.js API routes (server-side only)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── register/route.ts
│       ├── cart/
│       │   ├── route.ts              # Get cart
│       │   ├── add/route.ts
│       │   ├── update/route.ts
│       │   └── coupon/route.ts
│       ├── checkout/
│       │   └── create-order/route.ts # Server-side order creation
│       ├── orders/
│       │   └── [id]/route.ts         # Verify order status
│       └── webhooks/
│           └── woocommerce/route.ts  # Incoming WC webhooks
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AnnouncementBar.tsx
│   │   └── Navigation.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── VariationSelector.tsx
│   │   ├── AddToCartButton.tsx
│   │   └── PriceDisplay.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── ShippingSelector.tsx
│   │   └── PaymentMethodSelector.tsx
│   ├── account/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── OrderCard.tsx
│   └── ui/                           # Reusable design system components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Skeleton.tsx
│       └── Badge.tsx
├── context/
│   ├── CartContext.tsx
│   └── AuthContext.tsx
├── hooks/
│   ├── useCart.ts
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useStorefrontConfig.ts
├── lib/
│   ├── woocommerce.ts                # WooCommerce REST API client (server-side)
│   ├── cocart.ts                     # CoCart API client
│   ├── auth.ts                       # JWT handling helpers
│   ├── webhooks.ts                   # Webhook signature verification
│   └── storefront-config.ts          # Fetch plugin config
├── locales/
│   ├── ar.json
│   └── en.json
├── public/
│   ├── fonts/
│   └── images/
├── styles/
│   └── globals.css
├── middleware.ts                     # Locale detection and redirect
├── next.config.js
├── tailwind.config.js
└── .env.local                        # Environment variables (never committed)
```

---

## 18. Suggested Custom WordPress Plugin Folder Structure

*(See Section 5 for the full breakdown)*

```
wp-content/plugins/storefront-controller/
├── storefront-controller.php
├── includes/
│   ├── class-admin-settings.php
│   ├── class-rest-api.php
│   ├── class-settings-schema.php
│   └── class-sanitizer.php
├── admin/
│   ├── views/
│   │   ├── page-general.php
│   │   ├── page-homepage.php
│   │   ├── page-seo.php
│   │   └── page-checkout.php
│   └── assets/
│       ├── admin.css
│       └── admin.js
└── README.md
```

---

## 19. Recommended Tech Stack

### Frontend (Next.js)

| Category | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | ISR, server components, i18n support |
| Styling | Tailwind CSS + CSS logical properties | RTL-first, utility-first, fast |
| UI Components | shadcn/ui (customizable) | Unstyled base, full control |
| State Management | Zustand or React Context | Lightweight, no Redux complexity |
| Forms | React Hook Form + Zod | Performant, type-safe validation |
| i18n | next-intl | App Router compatible, supports RTL |
| HTTP Client | ky or native fetch | Lightweight, supports AbortController |
| Animations | Framer Motion | Smooth, accessible animations |
| Icons | Lucide React or Heroicons | Clean, consistent |
| SEO | next-seo or native metadata API | Structured, easy to manage |
| Sitemaps | next-sitemap | Automatic, configurable |
| Image Optimization | Next.js Image component | WebP, lazy load, responsive |
| Deployment | Vercel | ISR, edge functions, zero config |

### Backend (WordPress)

| Category | Choice | Reason |
|---|---|---|
| CMS | WordPress 6.5+ | Mature, well-supported |
| eCommerce | WooCommerce 9+ | Industry standard |
| Cart API | CoCart Pro | Clean headless cart REST API |
| Authentication | JWT Auth for WP REST API | Standard JWT implementation |
| Multilingual | WPML or Polylang | WooCommerce-compatible |
| Password Reset | WP REST Password Reset | Extends REST API |
| Performance | WP Rocket + Redis Object Cache | Fast responses |
| Security | Wordfence or Solid Security | Active threat protection |
| Hosting | Kinsta, WP Engine, or custom VPS (Ubuntu + Nginx + PHP-FPM + MySQL 8) | Managed or self-hosted |

---

## 20. Development Phases

### Phase 1 — Infrastructure Setup (Week 1)

- [ ] Provision WordPress hosting environment
- [ ] Install WordPress + WooCommerce
- [ ] Install and configure required WordPress plugins (CoCart, JWT Auth, WPML, WP Rocket)
- [ ] Configure WooCommerce: currency (SAR/USD), tax, shipping zones, payment gateways (sandbox)
- [ ] Enable HTTPS on WordPress
- [ ] Create WooCommerce API Consumer Key + Secret
- [ ] Set up Next.js project with TypeScript, Tailwind, next-intl, App Router
- [ ] Configure environment variables
- [ ] Set up i18n: `ar` (default), `en` — middleware for locale routing

### Phase 2 — Core Data Layer (Week 2)

- [ ] Build WooCommerce API client in `lib/woocommerce.ts` (server-side only)
- [ ] Build CoCart client in `lib/cocart.ts`
- [ ] Connect to Storefront Controller plugin (build the plugin, expose `/config` endpoint)
- [ ] Implement `useStorefrontConfig` hook with ISR
- [ ] Apply storefront config to layout (colors via CSS variables, fonts, logo)

### Phase 3 — Product Catalog (Week 3)

- [ ] Homepage with featured products and categories
- [ ] Category listing pages (ISR, pagination, filters)
- [ ] Product detail pages (ISR, images, description, pricing)
- [ ] Variable product support (attribute selectors, variation matching)
- [ ] Product search

### Phase 4 — Cart and Checkout (Weeks 4–5)

- [ ] Cart context (CoCart integration)
- [ ] Cart drawer / cart page
- [ ] Coupon code application
- [ ] Checkout form (billing, shipping address)
- [ ] Shipping method selector (real WooCommerce rates)
- [ ] Server-side order creation (`/api/checkout/create-order`)
- [ ] Payment gateway redirect flow
- [ ] Order success / failed / pending pages with server-side status verification
- [ ] WooCommerce webhook receiver

### Phase 5 — Customer Accounts (Week 6)

- [ ] Registration and login forms
- [ ] JWT authentication, HTTP-only cookie management
- [ ] Account dashboard
- [ ] Orders list and order detail
- [ ] Saved addresses management
- [ ] Profile and password update
- [ ] Password reset flow

### Phase 6 — RTL, i18n, and Content (Week 7)

- [ ] Full Arabic translation (`ar.json`)
- [ ] Full English translation (`en.json`)
- [ ] WPML: product and category translation on WordPress
- [ ] RTL/LTR CSS audit — verify all components with logical properties
- [ ] Arabic font loading and typography pass
- [ ] Language switcher component in header

### Phase 7 — SEO and Performance (Week 8)

- [ ] Metadata API setup for all page types
- [ ] JSON-LD structured data (Product, BreadcrumbList, Organization)
- [ ] `hreflang` tags
- [ ] XML sitemap (next-sitemap)
- [ ] Robots.txt
- [ ] Core Web Vitals pass (Lighthouse audit, image optimization, bundle analysis)
- [ ] ISR revalidation tuning

### Phase 8 — Security Audit and Testing (Week 9)

- [ ] Security review: API key exposure check, CORS headers, CSP headers
- [ ] WordPress hardening checklist
- [ ] Webhook signature verification test
- [ ] Cross-browser and device testing (mobile, tablet, desktop)
- [ ] RTL stress test across all browsers
- [ ] Load testing on key pages
- [ ] Penetration test on API routes

### Phase 9 — Production Deployment (Week 10)

- [ ] Set up production WordPress environment
- [ ] Configure payment gateways in production (live keys)
- [ ] Configure WooCommerce webhooks pointing to production Next.js URL
- [ ] Deploy Next.js to Vercel production
- [ ] Connect custom domain, verify HTTPS
- [ ] Smoke test complete purchase flow (including real payment in test mode)
- [ ] Monitor first 48 hours (error rates, page speed, order flow)

---

## 21. Expected Problems and How to Avoid Them

### Problem 1: Cart Session Mismatch

**Risk**: WooCommerce's native cart is session-based (PHP sessions). Doesn't work in headless.

**Solution**: Use CoCart from the start. Store the cart key in an HTTP-only cookie. Never use the legacy WooCommerce cart session.

---

### Problem 2: Price Manipulation by Users

**Risk**: Malicious users could intercept cart/checkout calls and modify prices.

**Solution**: Always create orders server-side (Next.js API route with Consumer Secret). WooCommerce calculates prices server-side from product IDs. Never pass prices from the client.

---

### Problem 3: RTL Breaking on Third-Party Components

**Risk**: Libraries like carousels, datepickers, and modals often don't support RTL.

**Solution**: Audit every third-party UI component before adopting it. Prefer libraries that document RTL support. Use CSS logical properties at the global level to catch the majority of cases automatically.

---

### Problem 4: WPML / Polylang + WooCommerce REST API Language Filtering

**Risk**: WooCommerce REST API might return all-language products, or might not respect the active language without explicit configuration.

**Solution**: WPML provides a `lang` query parameter for its REST API. Always append `?lang=ar` or `?lang=en` to every API call that returns translatable content. Test this early in Phase 2.

---

### Problem 5: Payment Gateway Redirect Doesn't Return to Next.js

**Risk**: WooCommerce defaults return URLs point to its own thank-you page, not your Next.js pages.

**Solution**: Configure the Custom Plugin's checkout return URL settings. Use WooCommerce hooks (`woocommerce_get_return_url`, `woocommerce_order_received_url`) in the plugin to override these URLs programmatically.

---

### Problem 6: Webhook Delivery Failure

**Risk**: WooCommerce retries failed webhooks but gives up after a set number of attempts. If your Next.js route is slow, webhooks time out.

**Solution**: The webhook handler must respond with HTTP 200 **immediately** and enqueue the event for async processing (via Redis queue or a simple database jobs table). Never do heavy processing in the webhook response.

---

### Problem 7: JWT Token Expiry During Long Sessions

**Risk**: Customer's JWT expires mid-session, causing silent auth failures.

**Solution**: Implement a token refresh flow. Store a long-lived refresh token (HTTP-only cookie), and refresh the access token silently in a Next.js middleware or on each authenticated API call when the response is 401.

---

### Problem 8: Arabic SEO — Google Indexing

**Risk**: Google may not crawl Arabic pages correctly if hreflang is misconfigured.

**Solution**: Implement `hreflang` correctly in `<head>` AND in the XML sitemap. Verify with Google Search Console after launch. Test that `/` (ar) and `/en/` (en) are both indexed and not treated as duplicate content.

---

### Problem 9: Performance Regression from Too Many API Calls

**Risk**: Homepage making 10+ independent WooCommerce API calls slows down TTFB.

**Solution**: Batch data fetching in `getStaticProps` or server components. Fetch all homepage data (featured products, categories, banners) in parallel using `Promise.all`. Cache aggressively with ISR.

---

### Problem 10: WooCommerce Plugin Conflicts

**Risk**: Installing too many plugins causes conflicts, slowing WordPress and breaking the REST API.

**Solution**: Keep the WordPress plugin list minimal. Only install: WooCommerce, CoCart, JWT Auth, WPML/Polylang, WP Rocket, Redis Object Cache, Wordfence, and the custom Storefront Controller plugin. Avoid general-purpose WordPress themes and unnecessary plugins.

---

## 22. Production Deployment Recommendations

### WordPress / WooCommerce

- **Hosting**: Managed WordPress host (Kinsta, WP Engine, or Cloudways) for automatic backups, staging environments, and server-level caching, OR a self-managed VPS (Ubuntu 22.04 + Nginx + PHP-FPM 8.2 + MySQL 8 + Redis)
- **Domain**: WordPress runs on `api.yourdomain.com` (not accessible by customers directly)
- **HTTPS**: Let's Encrypt (automatic) or commercial SSL certificate
- **Backups**: Daily automated database backups + file backups, retained for 30 days
- **Staging**: Maintain a staging environment (sub-domain) for testing changes before applying to production
- **Monitoring**: UptimeRobot or Pingdom for uptime monitoring; Sentry or Datadog for error tracking

### Next.js Frontend

- **Hosting**: Vercel (recommended) for zero-config ISR, edge functions, automatic preview deployments per branch
- **Domain**: `yourdomain.com` — configured in Vercel dashboard
- **Environment Variables**: All secrets set in Vercel environment variables (never in the repository)
- **CI/CD**: GitHub → Vercel automatic deployments on push to `main`
- **Error Tracking**: Sentry for Next.js (tracks client and server errors)
- **Analytics**: Vercel Analytics or Plausible (privacy-friendly, Arabic region compatible)

### Payment Gateways

- Enable live payment gateways only after full end-to-end testing in sandbox mode
- Keep sandbox keys in `.env.local` (never committed), live keys in Vercel environment variables
- Test each gateway's specific return URL and webhook behavior in staging before going live

### Launch Checklist

- [ ] Remove all test products, test orders, and test customers
- [ ] Set WooCommerce to production mode (disable sandbox on payment gateways)
- [ ] Verify all WooCommerce webhooks point to the production Next.js URL
- [ ] Run Lighthouse audit (target: Performance 90+, Accessibility 90+)
- [ ] Complete a full purchase flow with a real card (using a small test transaction)
- [ ] Verify Arabic and English order confirmation emails are sent correctly
- [ ] Verify RTL layout on iOS Safari, Android Chrome, and desktop Firefox
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Set up uptime monitoring and alert notifications

---

*This plan covers every architectural decision needed to build a production-grade headless WooCommerce store. Each phase is designed to be self-contained and deliver testable results. Follow the phases in order — do not skip the infrastructure and data layer phases, as they are prerequisites for everything that follows.*
