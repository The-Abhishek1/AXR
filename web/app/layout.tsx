// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Sidebar from '@/components/ui/Sidebar';
import Footer from '@/components/ui/Footer';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={cn(inter.className, 'bg-slate-950 text-white antialiased overflow-hidden')}>
        <div className="flex h-screen">
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Navbar />
            
            {/* Scrollable Content Area with flex column */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
              <div className="min-h-full flex flex-col">
                {/* Main content grows to push footer down */}
                <div className="flex-1">
                  {children}
                </div>
                {/* Footer stays at bottom of content, not screen */}
                <Footer />
              </div>
            </div>
          </div>
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}