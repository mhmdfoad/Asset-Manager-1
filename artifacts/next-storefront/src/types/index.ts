export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LocaleParams {
  locale: Locale;
}

export interface NavItem {
  labelKey: string;
  href: string;
  icon?: string;
}

export interface StorefrontConfig {
  logo?: string;
  siteName: string;
  primaryColor?: string;
  accentColor?: string;
  announcementText?: string;
  announcementVisible?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}
