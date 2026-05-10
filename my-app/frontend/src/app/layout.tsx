import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { TripProvider } from '@/context/TripContext';
import '@/app/globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700']
});

const sans = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'Traveloop',
  description: 'Personalized travel planning made easy.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} min-h-screen flex flex-col relative`}>
        <AuthProvider>
          <TripProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </TripProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
