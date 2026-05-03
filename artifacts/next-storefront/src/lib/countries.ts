export interface Country {
  code: string;
  nameEn: string;
  nameAr: string;
}

/** Curated list — Arab region first, then global destinations */
export const COUNTRIES: Country[] = [
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة' },
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت' },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر' },
  { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين' },
  { code: 'OM', nameEn: 'Oman', nameAr: 'عُمان' },
  { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن' },
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر' },
  { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان' },
  { code: 'IQ', nameEn: 'Iraq', nameAr: 'العراق' },
  { code: 'PS', nameEn: 'Palestine', nameAr: 'فلسطين' },
  { code: 'SY', nameEn: 'Syria', nameAr: 'سوريا' },
  { code: 'YE', nameEn: 'Yemen', nameAr: 'اليمن' },
  { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب' },
  { code: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر' },
  { code: 'TN', nameEn: 'Tunisia', nameAr: 'تونس' },
  { code: 'LY', nameEn: 'Libya', nameAr: 'ليبيا' },
  { code: 'SD', nameEn: 'Sudan', nameAr: 'السودان' },
  { code: 'TR', nameEn: 'Turkey', nameAr: 'تركيا' },
  { code: 'IN', nameEn: 'India', nameAr: 'الهند' },
  { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان' },
  { code: 'BD', nameEn: 'Bangladesh', nameAr: 'بنغلاديش' },
  { code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين' },
  { code: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة' },
  { code: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة' },
  { code: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا' },
  { code: 'FR', nameEn: 'France', nameAr: 'فرنسا' },
  { code: 'CA', nameEn: 'Canada', nameAr: 'كندا' },
  { code: 'AU', nameEn: 'Australia', nameAr: 'أستراليا' },
];
