import 'server-only';
import { wcFetch, WooCommerceConfigError } from './woocommerce';

/* ------------------------------------------------------------------ */
/* Internal WooCommerce REST shapes                                     */
/* ------------------------------------------------------------------ */

interface WooShippingZone {
  id: number;
  name: string;
  order: number;
}

interface WooZoneLocation {
  code: string;
  type: 'country' | 'state' | 'continent' | 'postcode';
}

interface WooZoneMethod {
  id: number;
  instance_id: number;
  title: string;
  order: number;
  enabled: boolean;
  method_id: string;
  method_title: string;
  settings: {
    cost?: { value: string };
    requires?: { value: string };
    min_amount?: { value: string };
    title?: { value: string };
  };
}

/* ------------------------------------------------------------------ */
/* Public types                                                         */
/* ------------------------------------------------------------------ */

export interface ShippingMethodResult {
  /** Unique ID for this method: `{zoneId}_{instanceId}` */
  id: string;
  instance_id: number;
  method_id: string;
  title: string;
  cost: number;
  free: boolean;
}

/* ------------------------------------------------------------------ */
/* getShippingMethods                                                   */
/* ------------------------------------------------------------------ */

/**
 * Fetches available shipping methods for a given country/state from WooCommerce.
 *
 * Strategy:
 *  1. Fetch all shipping zones + their locations.
 *  2. Match country/state to the most specific zone (state > country).
 *  3. Fall back to zone 0 ("Rest of the World") if no specific zone matches.
 *  4. Return enabled methods with server-side costs.
 *
 * For free_shipping: evaluates requires conditions (coupon, min_amount, either, both).
 * WooCommerce remains the source of truth — this is a preview only.
 */
export async function getShippingMethods(
  country: string,
  state?: string,
  subtotal?: number,
  hasCoupon?: boolean
): Promise<ShippingMethodResult[]> {
  try {
    const zonesResult = await wcFetch<WooShippingZone[]>('/shipping/zones', {}, 300);
    const zones = zonesResult.data;

    // Fetch zone locations in parallel (skip zone 0 = "everywhere" which has no locations)
    const zoneLocations = new Map<number, WooZoneLocation[]>();
    await Promise.all(
      zones
        .filter((z) => z.id !== 0)
        .map(async (zone) => {
          try {
            const res = await wcFetch<WooZoneLocation[]>(
              `/shipping/zones/${zone.id}/locations`,
              {},
              300
            );
            zoneLocations.set(zone.id, res.data);
          } catch {
            zoneLocations.set(zone.id, []);
          }
        })
    );

    // Normalize codes for comparison
    const countryUp = country.toUpperCase();
    const stateKey = state ? `${countryUp}:${state.toUpperCase()}` : '';

    // Find best-matching zone (sort by order, prefer state match over country match)
    let matchedZoneId: number | null = null;
    const sortedZones = zones.filter((z) => z.id !== 0).sort((a, b) => a.order - b.order);

    for (const zone of sortedZones) {
      const locations = zoneLocations.get(zone.id) ?? [];
      const stateMatches =
        stateKey && locations.some((l) => l.type === 'state' && l.code.toUpperCase() === stateKey);
      const countryMatches = locations.some(
        (l) => l.type === 'country' && l.code.toUpperCase() === countryUp
      );
      if (stateMatches || countryMatches) {
        matchedZoneId = zone.id;
        break;
      }
    }

    // Fall back to zone 0 ("Rest of the World") if no specific zone found
    const targetZoneId = matchedZoneId ?? 0;

    const methodsResult = await wcFetch<WooZoneMethod[]>(
      `/shipping/zones/${targetZoneId}/methods`,
      {},
      300
    );

    const results: ShippingMethodResult[] = [];

    for (const method of methodsResult.data) {
      if (!method.enabled) continue;

      let cost = 0;
      let free = false;

      if (method.method_id === 'free_shipping') {
        const requires = method.settings.requires?.value ?? '';
        const minAmount = parseFloat(method.settings.min_amount?.value ?? '0');

        if (requires === '') {
          free = true;
        } else if (requires === 'coupon' && hasCoupon) {
          free = true;
        } else if (requires === 'min_amount' && subtotal !== undefined && subtotal >= minAmount) {
          free = true;
        } else if (
          requires === 'either' &&
          (hasCoupon || (subtotal !== undefined && subtotal >= minAmount))
        ) {
          free = true;
        } else if (
          requires === 'both' &&
          hasCoupon &&
          subtotal !== undefined &&
          subtotal >= minAmount
        ) {
          free = true;
        }

        if (!free) continue; // Skip unavailable free shipping
        cost = 0;
      } else if (method.method_id === 'flat_rate' || method.method_id === 'local_pickup') {
        cost = parseFloat(method.settings.cost?.value ?? '0');
      } else {
        // Unknown method type — include with cost 0
        cost = 0;
      }

      const title = method.settings.title?.value || method.title || method.method_title;

      results.push({
        id: `${targetZoneId}_${method.instance_id}`,
        instance_id: method.instance_id,
        method_id: method.method_id,
        title,
        cost,
        free: free || cost === 0,
      });
    }

    return results;
  } catch (err) {
    if (err instanceof WooCommerceConfigError) throw err;
    // Return empty list on other errors — UI will show "no methods available"
    return [];
  }
}
