import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jewellery Next - Enterprise Jewellery Stores Software',
  description: 'Enterprise ERP for Jewellery Showrooms, POS Billing, Stock & Vault Management, Bullion Rates & Schemes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${sora.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={`${sora.className} h-full w-full overflow-hidden antialiased text-neutral-900 bg-white`}>
        {children}
      </body>
    </html>
  );
}
