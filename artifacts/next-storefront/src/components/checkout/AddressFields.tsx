'use client';

import { UseFormRegister, FieldErrors, Path } from 'react-hook-form';
import type { CheckoutFormData } from '@/lib/validations/checkout';
import { COUNTRIES } from '@/lib/countries';
import { cn } from '@/lib/utils';

interface AddressFieldsProps {
  prefix: 'billing' | 'shipping';
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isAr: boolean;
  /** Include email + phone fields (billing only) */
  includeContact?: boolean;
}

// Typed helper so we get correct key inference
function field(prefix: 'billing' | 'shipping', name: string) {
  return `${prefix}.${name}` as Path<CheckoutFormData>;
}

/** Reusable wrapper: label + input + inline error */
function Field({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-sm font-medium text-primary-800">
        {label}
        {required && <span className="ms-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-primary-800 outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-500';

const inputError =
  'border-red-300 focus:border-red-400 focus:ring-red-400';

export default function AddressFields({
  prefix,
  register,
  errors,
  isAr,
  includeContact = false,
}: AddressFieldsProps) {
  // Helper to get nested errors for this prefix
  const err = (name: string): string | undefined => {
    const section = errors[prefix] as Record<string, { message?: string }> | undefined;
    return section?.[name]?.message;
  };

  const l = isAr
    ? {
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        company: 'الشركة (اختياري)',
        email: 'البريد الإلكتروني',
        phone: 'رقم الجوال',
        country: 'الدولة',
        city: 'المدينة',
        state: 'المنطقة / المحافظة (اختياري)',
        address1: 'العنوان',
        address2: 'تفاصيل إضافية (اختياري)',
        postcode: 'الرمز البريدي (اختياري)',
        selectCountry: 'اختر الدولة...',
        firstNamePlaceholder: 'محمد',
        lastNamePlaceholder: 'العبدالله',
        emailPlaceholder: 'example@email.com',
        phonePlaceholder: '+966 5X XXX XXXX',
        cityPlaceholder: 'الرياض',
        address1Placeholder: 'الشارع، الحي',
        address2Placeholder: 'الطابق، الشقة...',
        postcodePlaceholder: '12345',
        statePlaceholder: 'الرياض',
      }
    : {
        firstName: 'First Name',
        lastName: 'Last Name',
        company: 'Company (Optional)',
        email: 'Email Address',
        phone: 'Phone Number',
        country: 'Country',
        city: 'City',
        state: 'State / Region (Optional)',
        address1: 'Address Line 1',
        address2: 'Address Line 2 (Optional)',
        postcode: 'Postcode (Optional)',
        selectCountry: 'Select a country...',
        firstNamePlaceholder: 'John',
        lastNamePlaceholder: 'Smith',
        emailPlaceholder: 'you@example.com',
        phonePlaceholder: '+1 555 000 0000',
        cityPlaceholder: 'Riyadh',
        address1Placeholder: 'Street address',
        address2Placeholder: 'Apartment, floor, etc.',
        postcodePlaceholder: '12345',
        statePlaceholder: 'Region',
      };

  return (
    <div className="flex flex-col gap-4">
      {/* Contact — billing only */}
      {includeContact && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={l.email} error={err('email')} required>
              <input
                type="email"
                placeholder={l.emailPlaceholder}
                autoComplete="email"
                {...register(field(prefix, 'email'))}
                className={cn(inputBase, err('email') && inputError)}
              />
            </Field>
            <Field label={l.phone} error={err('phone')} required>
              <input
                type="tel"
                placeholder={l.phonePlaceholder}
                autoComplete="tel"
                dir="ltr"
                {...register(field(prefix, 'phone'))}
                className={cn(inputBase, err('phone') && inputError)}
              />
            </Field>
          </div>
          <div className="my-1 border-t border-neutral-100" />
        </>
      )}

      {/* Name row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={l.firstName} error={err('first_name')} required>
          <input
            type="text"
            placeholder={l.firstNamePlaceholder}
            autoComplete={prefix === 'billing' ? 'given-name' : 'shipping given-name'}
            {...register(field(prefix, 'first_name'))}
            className={cn(inputBase, err('first_name') && inputError)}
          />
        </Field>
        <Field label={l.lastName} error={err('last_name')} required>
          <input
            type="text"
            placeholder={l.lastNamePlaceholder}
            autoComplete={prefix === 'billing' ? 'family-name' : 'shipping family-name'}
            {...register(field(prefix, 'last_name'))}
            className={cn(inputBase, err('last_name') && inputError)}
          />
        </Field>
      </div>

      {/* Company */}
      <Field label={l.company} error={err('company')}>
        <input
          type="text"
          placeholder={isAr ? 'اسم الشركة...' : 'Company name...'}
          autoComplete="organization"
          {...register(field(prefix, 'company'))}
          className={cn(inputBase, err('company') && inputError)}
        />
      </Field>

      {/* Country */}
      <Field label={l.country} error={err('country')} required>
        <select
          {...register(field(prefix, 'country'))}
          className={cn(inputBase, 'cursor-pointer', err('country') && inputError)}
        >
          <option value="">{l.selectCountry}</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {isAr ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>
      </Field>

      {/* City + State */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={l.city} error={err('city')} required>
          <input
            type="text"
            placeholder={l.cityPlaceholder}
            autoComplete={prefix === 'billing' ? 'address-level2' : 'shipping address-level2'}
            {...register(field(prefix, 'city'))}
            className={cn(inputBase, err('city') && inputError)}
          />
        </Field>
        <Field label={l.state} error={err('state')}>
          <input
            type="text"
            placeholder={l.statePlaceholder}
            autoComplete={prefix === 'billing' ? 'address-level1' : 'shipping address-level1'}
            {...register(field(prefix, 'state'))}
            className={cn(inputBase, err('state') && inputError)}
          />
        </Field>
      </div>

      {/* Address 1 */}
      <Field label={l.address1} error={err('address_1')} required>
        <input
          type="text"
          placeholder={l.address1Placeholder}
          autoComplete={prefix === 'billing' ? 'address-line1' : 'shipping address-line1'}
          {...register(field(prefix, 'address_1'))}
          className={cn(inputBase, err('address_1') && inputError)}
        />
      </Field>

      {/* Address 2 */}
      <Field label={l.address2} error={err('address_2')}>
        <input
          type="text"
          placeholder={l.address2Placeholder}
          autoComplete={prefix === 'billing' ? 'address-line2' : 'shipping address-line2'}
          {...register(field(prefix, 'address_2'))}
          className={cn(inputBase, err('address_2') && inputError)}
        />
      </Field>

      {/* Postcode */}
      <Field label={l.postcode} error={err('postcode')}>
        <input
          type="text"
          placeholder={l.postcodePlaceholder}
          autoComplete={prefix === 'billing' ? 'postal-code' : 'shipping postal-code'}
          dir="ltr"
          {...register(field(prefix, 'postcode'))}
          className={cn(inputBase, err('postcode') && inputError)}
        />
      </Field>
    </div>
  );
}
