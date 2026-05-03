<?php
/**
 * Authentication: login and registration logic.
 */

defined( 'ABSPATH' ) || exit;

class HWAuth_Auth {

	/**
	 * Roles that are blocked from logging in via the storefront.
	 */
	private const BLOCKED_ROLES = array( 'administrator', 'editor', 'author', 'contributor' );

	/**
	 * Authenticate a user by username/email + password.
	 *
	 * Includes IP-based rate limiting (10 attempts per 15 minutes).
	 *
	 * @return array|WP_Error  ['token' => '...', 'user' => [...]]
	 */
	public static function login( string $identifier, string $password ) {
		// ── Rate limiting ──────────────────────────────────────────────────────
		$ip       = sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0' );
		$rate_key = 'hwauth_rl_' . md5( $ip );
		$attempts = (int) get_transient( $rate_key );

		if ( $attempts >= 10 ) {
			return new WP_Error(
				'rate_limited',
				__( 'Too many login attempts. Please wait 15 minutes and try again.', 'headless-woo-auth' ),
				array( 'status' => 429 )
			);
		}

		// ── Authenticate ───────────────────────────────────────────────────────
		$user = wp_authenticate( $identifier, $password );

		if ( is_wp_error( $user ) ) {
			set_transient( $rate_key, $attempts + 1, 15 * MINUTE_IN_SECONDS );
			// Use a generic message to prevent username enumeration.
			return new WP_Error(
				'invalid_credentials',
				__( 'Invalid username/email or password.', 'headless-woo-auth' ),
				array( 'status' => 401 )
			);
		}

		// ── Clear rate limit on success ────────────────────────────────────────
		delete_transient( $rate_key );

		// ── Role check ─────────────────────────────────────────────────────────
		if ( ! self::is_allowed_user( $user ) ) {
			return new WP_Error(
				'unauthorized_role',
				__( 'This account is not authorized to log in here.', 'headless-woo-auth' ),
				array( 'status' => 403 )
			);
		}

		$token = HWAuth_Token::create( $user->ID, $user->user_email );

		return array(
			'token' => $token,
			'user'  => self::safe_user_data( $user ),
		);
	}

	/**
	 * Register a new WooCommerce customer.
	 *
	 * Includes IP-based rate limiting (5 registrations per hour).
	 *
	 * @param  array $data  Sanitized input from HWAuth_Sanitizer::register_input().
	 * @return array|WP_Error  ['token' => '...', 'user' => [...]]
	 */
	public static function register( array $data ) {
		// ── Rate limiting ──────────────────────────────────────────────────────
		$ip       = sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0' );
		$rate_key = 'hwauth_reg_' . md5( $ip );
		$attempts = (int) get_transient( $rate_key );

		if ( $attempts >= 5 ) {
			return new WP_Error(
				'rate_limited',
				__( 'Too many registration attempts. Please try again later.', 'headless-woo-auth' ),
				array( 'status' => 429 )
			);
		}

		// ── Duplicate email check ──────────────────────────────────────────────
		if ( email_exists( $data['email'] ) || username_exists( $data['email'] ) ) {
			return new WP_Error(
				'email_exists',
				__( 'An account with this email already exists.', 'headless-woo-auth' ),
				array( 'status' => 409 )
			);
		}

		// ── Create user ────────────────────────────────────────────────────────
		$user_id = wp_insert_user(
			array(
				'user_login'   => $data['email'],
				'user_email'   => $data['email'],
				'user_pass'    => $data['password'],
				'first_name'   => $data['first_name'],
				'last_name'    => $data['last_name'],
				'display_name' => trim( $data['first_name'] . ' ' . $data['last_name'] ),
				'role'         => 'customer',
			)
		);

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		set_transient( $rate_key, $attempts + 1, HOUR_IN_SECONDS );

		// ── WooCommerce customer meta ──────────────────────────────────────────
		update_user_meta( $user_id, 'billing_first_name', $data['first_name'] );
		update_user_meta( $user_id, 'billing_last_name', $data['last_name'] );
		update_user_meta( $user_id, 'billing_email', $data['email'] );

		if ( ! empty( $data['phone'] ) ) {
			update_user_meta( $user_id, 'billing_phone', $data['phone'] );
		}

		$user  = get_user_by( 'id', $user_id );
		$token = HWAuth_Token::create( $user_id, $data['email'] );

		return array(
			'token' => $token,
			'user'  => self::safe_user_data( $user ),
		);
	}

	/**
	 * Whether a user is allowed to log in via the storefront.
	 * Blocks admins/editors from using the headless auth endpoints.
	 */
	public static function is_allowed_user( WP_User $user ): bool {
		$user_roles = (array) $user->roles;
		foreach ( self::BLOCKED_ROLES as $blocked ) {
			if ( in_array( $blocked, $user_roles, true ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Return only safe, non-sensitive data for the response.
	 * Never expose password hash, capabilities, or internal meta.
	 */
	public static function safe_user_data( WP_User $user ): array {
		return array(
			'id'           => $user->ID,
			'email'        => $user->user_email,
			'first_name'   => (string) get_user_meta( $user->ID, 'first_name', true ),
			'last_name'    => (string) get_user_meta( $user->ID, 'last_name', true ),
			'display_name' => $user->display_name,
		);
	}
}
