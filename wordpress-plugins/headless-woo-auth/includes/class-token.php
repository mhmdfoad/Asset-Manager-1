<?php
/**
 * Token creation and validation.
 *
 * Format: {base64url(json_payload)}.{hmac_sha256(payload, SECRET)}
 *
 * Payload JSON keys (short to reduce cookie size):
 *   v   — schema version (int, currently 1)
 *   uid — WordPress user ID (int)
 *   eml — user email (string)
 *   iat — issued at (Unix timestamp)
 *   exp — expires at (Unix timestamp)
 */

defined( 'ABSPATH' ) || exit;

class HWAuth_Token {

	const SCHEMA_VERSION = 1;

	/**
	 * Create a signed token for the given user.
	 *
	 * @param  int    $user_id
	 * @param  string $email
	 * @return string Signed token string.
	 */
	public static function create( int $user_id, string $email ): string {
		$payload = wp_json_encode(
			array(
				'v'   => self::SCHEMA_VERSION,
				'uid' => $user_id,
				'eml' => $email,
				'iat' => time(),
				'exp' => time() + (int) HWAUTH_TOKEN_EXPIRY,
			)
		);

		$b64 = self::base64url_encode( $payload );
		$sig = hash_hmac( 'sha256', $b64, HEADLESS_AUTH_SECRET );

		return $b64 . '.' . $sig;
	}

	/**
	 * Validate a token string.
	 *
	 * @param  string $token
	 * @return array|WP_Error Decoded payload array on success, WP_Error on failure.
	 */
	public static function validate( string $token ) {
		$parts = explode( '.', $token, 2 );

		if ( count( $parts ) !== 2 || empty( $parts[0] ) || empty( $parts[1] ) ) {
			return new WP_Error(
				'invalid_token',
				__( 'Invalid token format.', 'headless-woo-auth' ),
				array( 'status' => 401 )
			);
		}

		list( $b64, $sig ) = $parts;

		$expected = hash_hmac( 'sha256', $b64, HEADLESS_AUTH_SECRET );

		// Timing-safe comparison prevents timing-based attacks.
		if ( ! hash_equals( $expected, $sig ) ) {
			return new WP_Error(
				'invalid_token',
				__( 'Invalid token signature.', 'headless-woo-auth' ),
				array( 'status' => 401 )
			);
		}

		$payload = json_decode( self::base64url_decode( $b64 ), true );

		if (
			! is_array( $payload ) ||
			! isset( $payload['v'], $payload['uid'], $payload['exp'] ) ||
			(int) $payload['v'] !== self::SCHEMA_VERSION
		) {
			return new WP_Error(
				'invalid_token',
				__( 'Invalid token payload.', 'headless-woo-auth' ),
				array( 'status' => 401 )
			);
		}

		if ( time() > (int) $payload['exp'] ) {
			return new WP_Error(
				'token_expired',
				__( 'Your session has expired. Please log in again.', 'headless-woo-auth' ),
				array( 'status' => 401 )
			);
		}

		return $payload;
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	private static function base64url_encode( string $data ): string {
		return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
	}

	private static function base64url_decode( string $data ): string {
		$pad = str_repeat( '=', 3 - ( 3 + strlen( $data ) ) % 4 );
		return base64_decode( strtr( $data . $pad, '-_', '+/' ) );
	}
}
