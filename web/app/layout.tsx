import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Sidebar from '@/components/ui/Sidebar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false, // This prevents the font preload error
});

export const metadata: Metadata = {
  title: 'AXR - Autonomous Execution Runtime',
  description: 'Modern workflow automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased overflow-hidden`}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-auto bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}