<?php
/**
 * REST API route registration and request handlers.
 */

defined( 'ABSPATH' ) || exit;

class HWAuth_REST_API {

	public static function register_routes(): void {
		$ns = HWAUTH_NAMESPACE;

		// ── Public endpoints ───────────────────────────────────────────────────
		register_rest_route( $ns, '/login',    array( 'methods' => 'POST', 'callback' => array( self::class, 'login' ),    'permission_callback' => '__return_true' ) );
		register_rest_route( $ns, '/register', array( 'methods' => 'POST', 'callback' => array( self::class, 'register' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( $ns, '/logout',   array( 'methods' => 'POST', 'callback' => array( self::class, 'logout' ),   'permission_callback' => '__return_true' ) );

		// ── Protected endpoints ────────────────────────────────────────────────
		$auth = array( self::class, 'auth_check' );

		register_rest_route( $ns, '/me',              array( 'methods' => 'GET',          'callback' => array( self::class, 'me' ),        'permission_callback' => $auth ) );
		register_rest_route( $ns, '/orders',          array( 'methods' => 'GET',          'callback' => array( self::class, 'orders' ),    'permission_callback' => $auth ) );
		register_rest_route( $ns, '/orders/(?P<id>\d+)', array( 'methods' => 'GET',       'callback' => array( self::class, 'order' ),     'permission_callback' => $auth ) );
		register_rest_route( $ns, '/addresses',       array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( self::class, 'addresses' ), 'permission_callback' => $auth ) );
		register_rest_route( $ns, '/profile',         array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( self::class, 'profile' ),   'permission_callback' => $auth ) );
	}

	// ── Auth middleware ────────────────────────────────────────────────────────

	/**
	 * Validate the Bearer token and attach the user ID to the request.
	 *
	 * WordPress calls this before the route callback.
	 * Returning WP_Error causes it to be sent as the response automatically.
	 *
	 * @return true|WP_Error
	 */
	public static function auth_check( WP_REST_Request $request ) {
		$auth_header = $request->get_header( 'Authorization' ) ?? '';

		if ( strpos( $auth_header, 'Bearer ' ) !== 0 ) {
			return new WP_Error(
				'missing_token',
				__( 'Authentication required. Provide a Bearer token.', 'headless-woo-auth' ),
				array( 'status' => 401 )
			);
		}

		$token   = substr( $auth_header, 7 );
		$payload = HWAuth_Token::validate( $token );

		if ( is_wp_error( $payload ) ) {
			return $payload;
		}

		// Store validated user ID on the request for use in callbacks.
		$request->set_param( '_hwauth_uid', (int) $payload['uid'] );

		return true;
	}

	// ── Public callbacks ───────────────────────────────────────────────────────

	public static function login( WP_REST_Request $request ) {
		$data = HWAuth_Sanitizer::login_input( $request );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$result = HWAuth_Auth::login( $data['identifier'], $data['password'] );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( $result, 200 );
	}

	public static function register( WP_REST_Request $request ) {
		$data = HWAuth_Sanitizer::register_input( $request );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$result = HWAuth_Auth::register( $data );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( $result, 201 );
	}

	public static function logout( WP_REST_Request $request ) {
		// Token invalidation happens on the Next.js side (cookie cleared).
		// WordPress is stateless — we just acknowledge the request.
		return new WP_REST_Response( array( 'success' => true ), 200 );
	}

	// ── Protected callbacks ────────────────────────────────────────────────────

	public static function me( WP_REST_Request $request ) {
		$uid    = (int) $request->get_param( '_hwauth_uid' );
		$result = HWAuth_Customers::get_me( $uid );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 200 );
	}

	public static function orders( WP_REST_Request $request ) {
		$uid      = (int) $request->get_param( '_hwauth_uid' );
		$page     = max( 1, (int) ( $request->get_param( 'page' ) ?? 1 ) );
		$per_page = min( 50, max( 1, (int) ( $request->get_param( 'per_page' ) ?? 10 ) ) );

		$orders = HWAuth_Customers::get_orders( $uid, $page, $per_page );
		return new WP_REST_Response( $orders, 200 );
	}

	public static function order( WP_REST_Request $request ) {
		$uid      = (int) $request->get_param( '_hwauth_uid' );
		$order_id = (int) $request->get_param( 'id' );

		$result = HWAuth_Customers::get_order( $uid, $order_id );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 200 );
	}

	public static function addresses( WP_REST_Request $request ) {
		$uid = (int) $request->get_param( '_hwauth_uid' );

		if ( $request->get_method() === 'POST' ) {
			$data   = HWAuth_Sanitizer::address_input( $request );
			$result = HWAuth_Customers::update_addresses( $uid, $data );
		} else {
			$result = HWAuth_Customers::get_addresses( $uid );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 200 );
	}

	public static function profile( WP_REST_Request $request ) {
		$uid = (int) $request->get_param( '_hwauth_uid' );

		if ( $request->get_method() === 'POST' ) {
			$data   = HWAuth_Sanitizer::profile_input( $request );
			$result = HWAuth_Customers::update_profile( $uid, $data );
		} else {
			$result = HWAuth_Customers::get_profile( $uid );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( $result, 200 );
	}
}
