# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### `artifacts/next-storefront` — Next.js Storefront (preview path `/`)
- **Framework**: Next.js 15, App Router, TypeScript
- **Styling**: Tailwind CSS v3, IBM Plex Sans Arabic font
- **i18n**: next-intl, Arabic (default, RTL) + English (LTR)
  - Arabic at `/`, English at `/en/`
  - `localeDetection: false` — Arabic is always default regardless of browser lang
- **WooCommerce**: Server-side only REST API client (`src/lib/woocommerce.ts`)
  - Credentials: `WOOCOMMERCE_STORE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`
  - Currency: `NEXT_PUBLIC_CURRENCY_SYMBOL` (default: `SAR`)
  - Slugs are URL-encoded Arabic — always `decodeURIComponent` before use in links
  - Image domain configured dynamically from `WOOCOMMERCE_STORE_URL` in `next.config.ts`
- **Caching**: products 60s revalidate, categories 300s revalidate

### Authentication (Phase 7) — Custom Headless WooCommerce Auth
- **WordPress plugin**: `wordpress-plugins/headless-woo-auth/` — install in `/wp-content/plugins/`
  - REST namespace: `headless-auth/v1`
  - Token format: `base64url(json_payload).hmac_sha256(payload, SECRET)` — no third-party JWT plugin
  - Rate limiting via WordPress transients (login: 10/15min, register: 5/hr per IP)
  - Configure in `wp-config.php`:
    - `define('HEADLESS_AUTH_SECRET', 'your-32+-char-secret');`
    - `define('HEADLESS_AUTH_ORIGIN', 'https://your-nextjs-domain.replit.app');`
- **Auth lib**: `src/lib/auth.ts` (server-only) — `getAuthToken()`, `getCurrentUser()`, `wpAuthGet()`, `wpAuthPost()`
- **Server Actions**: `src/app/actions/auth.ts` — `loginAction`, `registerAction`, `logoutAction`, `updateProfileAction`, `updateAddressAction`
- **Cookie**: HTTP-only `hwauth` cookie, 7-day expiry, never exposed to browser/localStorage
- **Account guard**: `src/app/[locale]/account/layout.tsx` — redirects to `/login` if not authenticated

### Key source files
- `src/lib/woocommerce.ts` — WooCommerce API client (server-only)
- `src/lib/auth.ts` — Headless auth helpers (server-only, reads hwauth cookie)
- `src/lib/products.ts` — data fetching functions (getProducts, getFeaturedProducts, etc.)
- `src/types/woocommerce.ts` — TypeScript types for products/categories
- `src/app/actions/auth.ts` — Server Actions for login/register/logout/profile/address
- `src/components/auth/` — LoginForm, RegisterForm, LogoutButton, AccountNav, ProfileForm, AddressForm
- `src/components/product/ProductCard.tsx` — reusable product card
- `src/components/product/ProductGrid.tsx` — product grid with empty state
- `src/components/product/ProductImageGallery.tsx` — client-side image gallery
- `src/components/shop/SortSelect.tsx` — URL-driven sort control
- `src/components/shop/SearchBar.tsx` — URL-driven search input
- `src/components/shop/ShopPagination.tsx` — URL-driven pagination
- `src/app/[locale]/page.tsx` — homepage (real categories + latest/featured products)
- `src/app/[locale]/shop/page.tsx` — shop page (grid + sort + search + pagination)
- `src/app/[locale]/product/[slug]/page.tsx` — product detail page
- `src/app/[locale]/category/[slug]/page.tsx` — category page

### Pages implemented
- `/` — Home (hero, categories, featured/latest products)
- `/shop` — Shop (grid, search, sort, pagination)
- `/product/[slug]` — Product detail (gallery, price, stock, attributes, related)
- `/category/[slug]` — Category (products filtered by category)
- `/login`, `/register` — Auth pages (ar + en, redirect if already logged in)
- `/account` — Dashboard (welcome, quick links, recent orders) — auth-guarded
- `/account/orders` — Order list with status badges — auth-guarded
- `/account/orders/[id]` — Order detail with ownership check — auth-guarded
- `/account/addresses` — Billing + shipping address forms — auth-guarded
- `/account/profile` — Profile update form — auth-guarded
- `/order/verify` — Universal post-payment verification page (Phase 6)
- `/cart`, `/checkout`, `/wishlist`, `/about`, `/contact`, `/blog` — various states

### CRITICAL routing rule
`/api/*` routes in this project go to the Express API Server artifact, NOT Next.js.
Never create Next.js Route Handlers under `/api/`. Use Server Actions for all mutations.

## WordPress Plugins
- `wordpress-plugins/headless-woo-return-redirect.php` — Phase 6: post-payment redirect handler
- `wordpress-plugins/headless-woo-auth/` — Phase 7: custom headless auth plugin

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
