import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calorie Deficit Tracker',
  description: 'Track your daily calorie deficit with Apple Health integration and AI-powered food search',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Calorie Tracker',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
