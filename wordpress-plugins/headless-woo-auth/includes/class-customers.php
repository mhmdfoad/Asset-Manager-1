<?php
/**
 * Customer data: profile, addresses, and order management.
 * All methods enforce customer isolation — users can only access their own data.
 */

defined( 'ABSPATH' ) || exit;

class HWAuth_Customers {

	// ── Profile / Me ──────────────────────────────────────────────────────────

	public static function get_me( int $user_id ) {
		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return new WP_Error( 'user_not_found', __( 'User not found.', 'headless-woo-auth' ), array( 'status' => 404 ) );
		}
		return HWAuth_Auth::safe_user_data( $user );
	}

	// ── Orders ────────────────────────────────────────────────────────────────

	/**
	 * Get paginated orders for a customer (most recent first).
	 * wc_get_orders() enforces customer_id so no cross-customer data leaks.
	 */
	public static function get_orders( int $user_id, int $page = 1, int $per_page = 10 ): array {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array();
		}

		$orders = wc_get_orders(
			array(
				'customer_id' => $user_id,
				'limit'       => $per_page,
				'page'        => $page,
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		);

		return array_map( array( self::class, 'safe_order_summary' ), $orders );
	}

	/**
	 * Get a single order, verifying it belongs to the authenticated customer.
	 */
	public static function get_order( int $user_id, int $order_id ) {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return new WP_Error( 'woocommerce_missing', __( 'WooCommerce is not active.', 'headless-woo-auth' ), array( 'status' => 500 ) );
		}

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return new WP_Error( 'order_not_found', __( 'Order not found.', 'headless-woo-auth' ), array( 'status' => 404 ) );
		}

		// Ownership check — prevents any customer from reading another customer's order.
		if ( (int) $order->get_customer_id() !== $user_id ) {
			return new WP_Error( 'forbidden', __( 'You do not have permission to view this order.', 'headless-woo-auth' ), array( 'status' => 403 ) );
		}

		return self::safe_order_detail( $order );
	}

	// ── Addresses ─────────────────────────────────────────────────────────────

	public static function get_addresses( int $user_id ): array {
		$data = array();
		foreach ( self::address_meta_keys() as $key ) {
			$data[ $key ] = (string) get_user_meta( $user_id, $key, true );
		}
		return $data;
	}

	public static function update_addresses( int $user_id, array $data ): array {
		$allowed = self::address_meta_keys();
		foreach ( $data as $key => $value ) {
			if ( in_array( $key, $allowed, true ) ) {
				update_user_meta( $user_id, $key, sanitize_text_field( $value ) );
			}
		}
		return self::get_addresses( $user_id );
	}

	// ── Profile ───────────────────────────────────────────────────────────────

	public static function get_profile( int $user_id ): array {
		$user = get_user_by( 'id', $user_id );
		return array(
			'first_name'    => (string) get_user_meta( $user_id, 'first_name', true ),
			'last_name'     => (string) get_user_meta( $user_id, 'last_name', true ),
			'display_name'  => $user ? $user->display_name : '',
			'email'         => $user ? $user->user_email : '',
			'billing_phone' => (string) get_user_meta( $user_id, 'billing_phone', true ),
		);
	}

	public static function update_profile( int $user_id, array $data ) {
		$wp_update = array( 'ID' => $user_id );

		if ( isset( $data['first_name'] ) ) {
			$wp_update['first_name'] = $data['first_name'];
			update_user_meta( $user_id, 'first_name', $data['first_name'] );
		}
		if ( isset( $data['last_name'] ) ) {
			$wp_update['last_name'] = $data['last_name'];
			update_user_meta( $user_id, 'last_name', $data['last_name'] );
		}
		if ( isset( $data['display_name'] ) ) {
			$wp_update['display_name'] = $data['display_name'];
		}
		if ( isset( $data['billing_phone'] ) ) {
			update_user_meta( $user_id, 'billing_phone', $data['billing_phone'] );
		}

		$result = wp_update_user( $wp_update );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return self::get_profile( $user_id );
	}

	// ── Private helpers ───────────────────────────────────────────────────────

	private static function safe_order_summary( WC_Order $order ): array {
		return array(
			'id'                   => $order->get_id(),
			'number'               => $order->get_order_number(),
			'status'               => $order->get_status(),
			'total'                => (float) $order->get_total(),
			'currency'             => $order->get_currency(),
			'currency_symbol'      => get_woocommerce_currency_symbol( $order->get_currency() ),
			'payment_method_title' => $order->get_payment_method_title(),
			'date_created'         => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : null,
			'item_count'           => $order->get_item_count(),
		);
	}

	private static function safe_order_detail( WC_Order $order ): array {
		$items = array();
		foreach ( $order->get_items() as $item ) {
			$items[] = array(
				'id'       => $item->get_id(),
				'name'     => $item->get_name(),
				'quantity' => $item->get_quantity(),
				'total'    => (float) $item->get_total(),
			);
		}

		return array(
			'id'                   => $order->get_id(),
			'number'               => $order->get_order_number(),
			'status'               => $order->get_status(),
			'total'                => (float) $order->get_total(),
			'subtotal'             => (float) $order->get_subtotal(),
			'total_tax'            => (float) $order->get_total_tax(),
			'shipping_total'       => (float) $order->get_shipping_total(),
			'discount_total'       => (float) $order->get_discount_total(),
			'currency'             => $order->get_currency(),
			'currency_symbol'      => get_woocommerce_currency_symbol( $order->get_currency() ),
			'payment_method'       => $order->get_payment_method(),
			'payment_method_title' => $order->get_payment_method_title(),
			'date_created'         => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : null,
			'customer_note'        => $order->get_customer_note(),
			'line_items'           => $items,
			'billing'              => array(
				'first_name' => $order->get_billing_first_name(),
				'last_name'  => $order->get_billing_last_name(),
				'city'       => $order->get_billing_city(),
				'country'    => $order->get_billing_country(),
				'phone'      => $order->get_billing_phone(),
				'email'      => $order->get_billing_email(),
			),
		);
	}

	private static function address_meta_keys(): array {
		return array(
			'billing_first_name', 'billing_last_name', 'billing_company',
			'billing_email', 'billing_phone',
			'billing_country', 'billing_state', 'billing_city',
			'billing_address_1', 'billing_address_2', 'billing_postcode',
			'shipping_first_name', 'shipping_last_name', 'shipping_company',
			'shipping_country', 'shipping_state', 'shipping_city',
			'shipping_address_1', 'shipping_address_2', 'shipping_postcode',
		);
	}
}
