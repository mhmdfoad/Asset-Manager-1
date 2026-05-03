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

### Key source files
- `src/lib/woocommerce.ts` — WooCommerce API client (server-only)
- `src/lib/products.ts` — data fetching functions (getProducts, getFeaturedProducts, etc.)
- `src/types/woocommerce.ts` — TypeScript types for products/categories
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
- `/cart`, `/checkout`, `/account`, `/wishlist`, `/about`, `/contact`, `/blog` — placeholders

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
