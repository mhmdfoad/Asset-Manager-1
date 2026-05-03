# Headless Woo Auth

Custom headless authentication plugin for WooCommerce. Provides secure REST endpoints for customer login, registration, and account management — no third-party JWT plugin required.

## Installation

1. Upload the `headless-woo-auth/` folder to `/wp-content/plugins/headless-woo-auth/`
2. Activate in **WP Admin → Plugins → Headless Woo Auth**
3. Add to `wp-config.php` (above the `/* That's all, stop editing! */` line):

```php
// Required: strong random secret (minimum 32 characters)
define( 'HEADLESS_AUTH_SECRET', 'your-long-random-secret-here-at-least-32-chars' );

// Required: your Next.js frontend domain (no trailing slash)
define( 'HEADLESS_AUTH_ORIGIN', 'https://your-nextjs-domain.replit.app' );

// Optional: token lifetime in seconds (default: 7 days)
// define( 'HWAUTH_TOKEN_EXPIRY', 604800 );
```

## REST Endpoints

**Base:** `/wp-json/headless-auth/v1/`

### Public (no authentication required)

| Method | Endpoint   | Description                         |
|--------|------------|-------------------------------------|
| POST   | `/login`   | Authenticate with email + password  |
| POST   | `/register`| Create a new customer account       |
| POST   | `/logout`  | Acknowledge logout (stateless)      |

### Protected (Authorization: Bearer {token} required)

| Method      | Endpoint          | Description                        |
|-------------|-------------------|------------------------------------|
| GET         | `/me`             | Get current user info              |
| GET         | `/orders`         | List customer's orders             |
| GET         | `/orders/{id}`    | Get single order (ownership check) |
| GET / POST  | `/addresses`      | Get / update billing+shipping      |
| GET / POST  | `/profile`        | Get / update profile               |

## Token Format

```
{base64url(json_payload)}.{hmac_sha256(payload, HEADLESS_AUTH_SECRET)}
```

Payload fields: `v` (schema version), `uid` (user ID), `eml` (email), `iat` (issued at), `exp` (expires at).

Signature uses `hash_equals()` (timing-safe). Secret is never sent to the browser.

## Security Notes

- Tokens are stored in HTTP-only cookies by Next.js — never in localStorage
- Login attempts are rate-limited to 10 per IP per 15 minutes (via transients)
- Registration is rate-limited to 5 per IP per hour
- Administrator / editor / author roles are blocked from storefront login
- Order endpoints verify ownership — customers can only see their own orders
- All inputs are sanitized before processing
- Token signature uses `hash_equals()` to prevent timing attacks

## Why Not a Third-Party JWT Plugin?

Third-party JWT plugins (e.g. "JWT Authentication for WP REST API") require specific PHP extensions (`ext-jwt`), server configuration changes, and frequently break across WordPress updates. This plugin uses only WordPress core functions and PHP built-ins — no extra dependencies needed.
