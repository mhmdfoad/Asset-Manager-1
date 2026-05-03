<?php
/**
 * Input sanitization helpers.
 * Every REST endpoint must sanitize and validate via this class before processing.
 */

defined( 'ABSPATH' ) || exit;

class HWAuth_Sanitizer {

	/**
	 * Sanitize and validate login input.
	 *
	 * @return array|WP_Error  ['identifier' => string, 'password' => string]
	 */
	public static function login_input( WP_REST_Request $request ) {
		$identifier = sanitize_text_field( $request->get_param( 'username_or_email' ) ?? '' );
		$password   = $request->get_param( 'password' ) ?? '';

		if ( empty( $identifier ) ) {
			return new WP_Error( 'missing_field', __( 'Username or email is required.', 'headless-woo-auth' ), array( 'status' => 400 ) );
		}
		if ( empty( $password ) ) {
			return new WP_Error( 'missing_field', __( 'Password is required.', 'headless-woo-auth' ), array( 'status' => 400 ) );
		}

		return compact( 'identifier', 'password' );
	}

	/**
	 * Sanitize and validate registration input.
	 *
	 * @return array|WP_Error
	 */
	public static function register_input( WP_REST_Request $request ) {
		$first_name = sanitize_text_field( $request->get_param( 'first_name' ) ?? '' );
		$last_name  = sanitize_text_field( $request->get_param( 'last_name' ) ?? '' );
		$email      = sanitize_email( $request->get_param( 'email' ) ?? '' );
		$password   = $request->get_param( 'password' ) ?? '';
		$phone      = sanitize_text_field( $request->get_param( 'phone' ) ?? '' );

		if ( empty( $first_name ) ) {
			return new WP_Error( 'missing_field', __( 'First name is required.', 'headless-woo-auth' ), array( 'status' => 400 ) );
		}
		if ( empty( $last_name ) ) {
			return new WP_Error( 'missing_field', __( 'Last name is required.', 'headless-woo-auth' ), array( 'status' => 400 ) );
		}
		if ( ! is_email( $email ) ) {
			return new WP_Error( 'invalid_email', __( 'A valid email address is required.', 'headless-woo-auth' ), array( 'status' => 400 ) );
		}
		if ( strlen( $password ) < 8 ) {
			return new WP_Error( 'weak_password', __( 'Password must be at least 8 characters.', 'headless-woo-auth' ), array( 'status' => 400 ) );
		}

		return compact( 'first_name', 'last_name', 'email', 'password', 'phone' );
	}

	/**
	 * Sanitize address update input.
	 *
	 * @return array  Only whitelisted meta keys are returned.
	 */
	public static function address_input( WP_REST_Request $request ): array {
		$allowed = array(
			'billing_first_name', 'billing_last_name', 'billing_company',
			'billing_email', 'billing_phone',
			'billing_country', 'billing_state', 'billing_city',
			'billing_address_1', 'billing_address_2', 'billing_postcode',
			'shipping_first_name', 'shipping_last_name', 'shipping_company',
			'shipping_country', 'shipping_state', 'shipping_city',
			'shipping_address_1', 'shipping_address_2', 'shipping_postcode',
		);

		$data = array();
		foreach ( $allowed as $key ) {
			$val = $request->get_param( $key );
			if ( $val !== null ) {
				$data[ $key ] = sanitize_text_field( (string) $val );
			}
		}

		return $data;
	}

	/**
	 * Sanitize profile update input.
	 *
	 * @return array
	 */
	public static function profile_input( WP_REST_Request $request ): array {
		$data = array();

		foreach ( array( 'first_name', 'last_name', 'display_name' ) as $field ) {
			$val = $request->get_param( $field );
			if ( $val !== null ) {
				$data[ $field ] = sanitize_text_field( (string) $val );
			}
		}

		$phone = $request->get_param( 'billing_phone' );
		if ( $phone !== null ) {
			$data['billing_phone'] = sanitize_text_field( (string) $phone );
		}

		return $data;
	}
}
