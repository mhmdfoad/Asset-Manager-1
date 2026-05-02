import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function Footer() {
  const t = await getTranslations('Footer');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-primary-800 text-white">
      {/* Main Footer */}
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <p className="text-xl font-bold">
              <span className="text-accent-400">●</span> متجر
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: t('about'), href: '/about' },
                { label: t('contact'), href: '/contact' },
                { label: t('faq'), href: '/contact#faq' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as any}
                    className="text-sm text-white/60 transition-colors hover:text-accent-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              {t('support')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: t('returns'), href: '/contact' },
                { label: t('privacy'), href: '/privacy-policy' },
                { label: t('terms'), href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href as any}
                    className="text-sm text-white/60 transition-colors hover:text-accent-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social / Follow */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              {t('followUs')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Instagram', 'Twitter', 'Facebook', 'TikTok'].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-white/60 transition-colors hover:border-accent-400 hover:text-accent-400"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-sm text-white/40 sm:flex-row">
          <p>
            © {currentYear} متجر — {t('rights')}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white/70">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-white/70">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
