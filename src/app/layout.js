import './globals.css';
import AppleHeader from '@/components/AppleHeader';
import AppleFooter from '@/components/AppleFooter';

export const metadata = {
  title: 'TasteTransplant — Grounded Taste Concierge',
  description: 'Relocate anywhere and transplant your distinct taste. Grounded in the Qloo Taste Graph.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppleHeader />
        {children}
        <AppleFooter />
      </body>
    </html>
  );
}
