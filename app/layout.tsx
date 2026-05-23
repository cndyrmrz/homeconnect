import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter — the standard font for premium SaaS (Linear, Vercel, Stripe, Notion)
// geist is loaded from the npm package after install; fallback is Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'HomeConnect', template: '%s — HomeConnect' },
  description: 'AI-powered lead qualification and appointment booking for real estate.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
