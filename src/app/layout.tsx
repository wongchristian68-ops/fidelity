import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils";
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthRedirect } from '@/components/auth-redirect';

export const metadata: Metadata = {
  title: 'Fidélité & Partage',
  description: 'Fidélité & Parrainage Simplifiés',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#f97316" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js" type="text/javascript"></script>
      </head>
      <body className={cn("font-body antialiased min-h-screen bg-background")}>
        <FirebaseClientProvider>
          <AuthRedirect>
            <main className="max-w-md mx-auto bg-background min-h-screen">
              {children}
            </main>
            <Toaster />
          </AuthRedirect>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
