"use client";

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Html5QrcodeScanner: any;
  }
}

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
}

const QrScanner = ({ onScanSuccess, onScanError }: QrScannerProps) => {
  const scannerRef = useRef<any>(null);
  const readerId = "html5qr-code-full-region";

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Html5QrcodeScanner && !scannerRef.current) {
      const html5QrcodeScanner = new window.Html5QrcodeScanner(
        readerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 for camera
        },
        /* verbose= */ false
      );
      
      html5QrcodeScanner.render(onScanSuccess, onScanError);
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error: any) => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id={readerId} className="w-full" />;
};

export default QrScanner;
