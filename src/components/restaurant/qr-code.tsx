"use client";

import { useEffect, useRef } from 'react';

declare global {
    interface Window { QRCode: any; }
}

interface QrCodeDisplayProps {
  value: string;
  size?: number;
}

export function QrCodeDisplay({ value, size = 150 }: QrCodeDisplayProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (qrCodeRef.current && typeof window.QRCode !== 'undefined') {
        if (!qrInstanceRef.current) {
            qrInstanceRef.current = new window.QRCode(qrCodeRef.current, {
                text: value,
                width: size,
                height: size,
                colorDark: "#1F2937",
                colorLight: "#ffffff",
                correctLevel: window.QRCode.CorrectLevel.H
            });
        } else {
            qrInstanceRef.current.clear();
            qrInstanceRef.current.makeCode(value);
        }
    }
  }, [value, size]);

  return <div ref={qrCodeRef} />;
}
