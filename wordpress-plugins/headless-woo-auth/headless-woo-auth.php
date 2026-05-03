<?php
/**
 * Plugin Name:  Headless Woo Auth
 * Plugin URI:   https://github.com/your-repo/headless-woo-auth
 * Description:  Custom headless authentication for WooCommerce. Provides secure custom REST
 *               endpoints for customer login, registration, and account management without
 *               requiring any third-party JWT plugin.
 * Version:      1.0.0
 * Requires at least: 5.8
 * Requires PHP:  7.4
 * Author:        Your Team
 * License:       GPL-2.0-or-later
 *
 * ── INSTALLATION ──────────────────────────────────────────────────────────────
 * 1. Upload this folder to:
 *      /wp-content/plugins/headless-woo-auth/
 * 2. Activate in WP Admin → Plugins → Activate "Headless Woo Auth".
 * 3. Add the following to wp-config.php (above the "stop editing" line):
 *
 *      // Required: strong random secret (min 32 chars)
 *      define( 'HEADLESS_AUTH_SECRET', 'replace-with-a-long-random-string-of-at-least-32-chars' );
 *
 *      // Required: your Next.js frontend origin for CORS
 *      define( 'HEADLESS_AUTH_ORIGIN', 'https://your-nextjs-domain.replit.app' );
 *
 * ── WHY NO THIRD-PARTY JWT PLUGIN ─────────────────────────────────────────────
 * Third-party JWT plugins (e.g. JWT Authentication for WP REST API) require
 * PHP module "php-jwt" and specific server configuration, and frequently break
 * across WordPress and WooCommerce updates.
 *
 * This plugin uses only WordPress core functions:
 *   - wp_authenticate()     → user validation
 *   - hash_hmac()           → token signing (PHP built-in, always available)
 *   - WP_Error              → standard error responses
 *   - wc_get_orders()       → orders with customer isolation
 *   - update_user_meta()    → address/profile management
 *
 * ── TOKEN FORMAT ──────────────────────────────────────────────────────────────
 * {base64url(json_payload)}.{hmac_sha256(payload, SECRET)}
 *
 * Payload fields: v, uid, eml, iat, exp
 * Signature uses timing-safe hash_equals() to prevent timing attacks.
 *
 * ── REST ENDPOINTS ────────────────────────────────────────────────────────────
 * Public (no auth):
 *   POST /wp-json/headless-auth/v1/login
 *   POST /wp-json/headless-auth/v1/register
 *   POST /wp-json/headless-auth/v1/logout
 *
 * Protected (Authorization: Bearer {token}):
 *   GET  /wp-json/headless-auth/v1/me
 *   GET  /wp-json/headless-auth/v1/orders
 *   GET  /wp-json/headless-auth/v1/orders/{id}
 *   GET  /wp-json/headless-auth/v1/addresses
 *   POST /wp-json/headless-auth/v1/addresses
 *   GET  /wp-json/headless-auth/v1/profile
 *   POST /wp-json/headless-auth/v1/profile
 */

defined( 'ABSPATH' ) || exit;

define( 'HWAUTH_VERSION',   '1.0.0' );
define( 'HWAUTH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'HWAUTH_NAMESPACE',  'headless-auth/v1' );

// Token lifetime: 7 days
if ( ! defined( 'HWAUTH_TOKEN_EXPIRY' ) ) {
	define( 'HWAUTH_TOKEN_EXPIRY', 7 * DAY_IN_SECONDS );
}

// Secret — set HEADLESS_AUTH_SECRET in wp-config.php.
// Falls back to WordPress AUTH_KEY (which changes on key rotation).
// STRONGLY recommended to define your own constant.
if ( ! defined( 'HEADLESS_AUTH_SECRET' ) ) {
	define( 'HEADLESS_AUTH_SECRET', defined( 'AUTH_KEY' ) ? AUTH_KEY : 'insecure-default-change-me' );
}

// Frontend origin for CORS — set HEADLESS_AUTH_ORIGIN in wp-config.php.
if ( ! defined( 'HEADLESS_AUTH_ORIGIN' ) ) {
	define( 'HEADLESS_AUTH_ORIGIN', '' );
}

require_once HWAUTH_PLUGIN_DIR . 'includes/class-sanitizer.php';
require_once HWAUTH_PLUGIN_DIR . 'includes/class-token.php';
require_once HWAUTH_PLUGIN_DIR . 'includes/class-auth.php';
require_once HWAUTH_PLUGIN_DIR . 'includes/class-customers.php';
require_once HWAUTH_PLUGIN_DIR . 'includes/class-rest-api.php';

add_action( 'rest_api_init', array( 'HWAuth_REST_API', 'register_routes' ) );

// CORS headers for the headless frontend origin.
add_action(
	'rest_api_init',
	function () {
		$origin = HEADLESS_AUTH_ORIGIN;
		if ( $origin ) {
			remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
			add_filter(
				'rest_pre_serve_request',
				function ( $value ) use ( $origin ) {
					header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
					header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
					header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
					header( 'Access-Control-Allow-Credentials: true' );
					return $value;
				}
			);
		}
	},
	15
);
