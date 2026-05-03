import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Locale-aware error messages                                         */
/* ------------------------------------------------------------------ */

interface Messages {
  required: string;
  firstName: string;
  lastName: string;
  emailRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  phoneInvalid: string;
  countryRequired: string;
  cityRequired: string;
  addressRequired: string;
}

function getMessages(isAr: boolean): Messages {
  return isAr
    ? {
        required: 'هذا الحقل مطلوب',
        firstName: 'الاسم الأول مطلوب',
        lastName: 'اسم العائلة مطلوب',
        emailRequired: 'البريد الإلكتروني مطلوب',
        emailInvalid: 'بريد إلكتروني غير صحيح',
        phoneRequired: 'رقم الجوال مطلوب',
        phoneInvalid: 'رقم الجوال غير صحيح (7 أرقام على الأقل)',
        countryRequired: 'الدولة مطلوبة',
        cityRequired: 'المدينة مطلوبة',
        addressRequired: 'العنوان مطلوب',
      }
    : {
        required: 'This field is required',
        firstName: 'First name is required',
        lastName: 'Last name is required',
        emailRequired: 'Email address is required',
        emailInvalid: 'Invalid email address',
        phoneRequired: 'Phone number is required',
        phoneInvalid: 'Invalid phone number (at least 7 digits)',
        countryRequired: 'Country is required',
        cityRequired: 'City is required',
        addressRequired: 'Address is required',
      };
}

/* ------------------------------------------------------------------ */
/* Address sub-schemas                                                  */
/* ------------------------------------------------------------------ */

export function createBillingSchema(isAr: boolean) {
  const m = getMessages(isAr);
  return z.object({
    first_name: z.string().min(1, m.firstName).max(100),
    last_name: z.string().min(1, m.lastName).max(100),
    company: z.string().max(200).optional().or(z.literal('')),
    email: z.string().min(1, m.emailRequired).email(m.emailInvalid),
    // Lenient phone validation: any 7-25 character string that looks like a phone.
    // We intentionally avoid strict character-set regexes — phone numbers vary widely
    // (dots, slashes, dashes, country prefixes) and WooCommerce stores many formats.
    phone: z
      .string()
      .min(7, m.phoneInvalid)
      .max(25, m.phoneInvalid)
      .regex(/^[+\d][\d\s\+\-\(\)\.#\/]+$/, m.phoneInvalid),
    country: z.string().min(1, m.countryRequired),
    city: z.string().min(1, m.cityRequired).max(100),
    state: z.string().max(100).optional().or(z.literal('')),
    address_1: z.string().min(1, m.addressRequired).max(200),
    address_2: z.string().max(200).optional().or(z.literal('')),
    postcode: z.string().max(20).optional().or(z.literal('')),
  });
}

export function createShippingSchema(isAr: boolean) {
  const m = getMessages(isAr);
  return z.object({
    first_name: z.string().min(1, m.firstName).max(100),
    last_name: z.string().min(1, m.lastName).max(100),
    company: z.string().max(200).optional().or(z.literal('')),
    country: z.string().min(1, m.countryRequired),
    city: z.string().min(1, m.cityRequired).max(100),
    state: z.string().max(100).optional().or(z.literal('')),
    address_1: z.string().min(1, m.addressRequired).max(200),
    address_2: z.string().max(200).optional().or(z.literal('')),
    postcode: z.string().max(20).optional().or(z.literal('')),
  });
}

/* ------------------------------------------------------------------ */
/* Root checkout schema                                                 */
/* ------------------------------------------------------------------ */

export function createCheckoutSchema(isAr: boolean) {
  return z
    .object({
      billing: createBillingSchema(isAr),
      sameAsBilling: z.boolean().default(true),
      // All shipping sub-fields are optional at the object level.
      // Required fields are enforced by superRefine ONLY when sameAsBilling=false,
      // so hidden shipping values never block submission.
      shipping: createShippingSchema(isAr).partial().optional(),
      couponCode: z.string().max(100).optional().or(z.literal('')),
      customerNote: z.string().max(1000).optional().or(z.literal('')),
      paymentMethod: z.string().min(1).default('cod'),
    })
    .superRefine((data, ctx) => {
      // Validate shipping required fields only when the user explicitly
      // wants a different shipping address.
      if (!data.sameAsBilling) {
        const result = createShippingSchema(isAr).safeParse(data.shipping);
        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({ ...issue, path: ['shipping', ...issue.path] });
          }
        }
      }
    });
}

/* ------------------------------------------------------------------ */
/* Shared type (shape is locale-independent)                           */
/* ------------------------------------------------------------------ */
const _typeSchema = createCheckoutSchema(false);
export type CheckoutFormData = z.infer<typeof _typeSchema>;
export type BillingData = z.infer<ReturnType<typeof createBillingSchema>>;
export type ShippingData = z.infer<ReturnType<typeof createShippingSchema>>;

/* ------------------------------------------------------------------ */
/* Server-side API validation schema (strict, no i18n needed)         */
/* ------------------------------------------------------------------ */

const ServerAddressSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(25).optional(),
  country: z.string().min(1).max(10),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  address_1: z.string().min(1).max(200),
  address_2: z.string().max(200).optional(),
  postcode: z.string().max(20).optional(),
});

const ServerCartItemSchema = z.object({
  product_id: z.number().int().positive(),
  variation_id: z.number().int().nonnegative().optional(),
  quantity: z.number().int().min(1).max(999),
});

export const ServerCheckoutSchema = z.object({
  cartItems: z
    .array(ServerCartItemSchema)
    .min(1, 'Cart is empty')
    .max(100, 'Too many items'),
  billing: ServerAddressSchema,
  shipping: ServerAddressSchema.optional(),
  couponCode: z.string().max(100).optional(),
  customerNote: z.string().max(1000).optional(),
  paymentMethod: z.string().max(50).default('cod'),
});

export type ServerCheckoutInput = z.infer<typeof ServerCheckoutSchema>;
