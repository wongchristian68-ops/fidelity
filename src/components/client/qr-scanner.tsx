"use client";

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Html5QrcodeScanner: any;
    Html5Qrcode: any;
  }
}

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
}

const QrScanner = ({ onScanSuccess, onScanError }: QrScannerProps) => {
  const scannerRef = useRef<any>(null);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const readerId = "html5qr-code-full-region";

  useEffect(() => {
    const checkPermissionsAndInitialize = async () => {
      if (typeof window !== 'undefined' && window.Html5Qrcode) {
        try {
          const devices = await window.Html5Qrcode.getCameras();
          if (devices && devices.length) {
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
        } catch (err) {
          setHasPermission(false);
          onScanError('Erreur d\'accès à la caméra.');
        }
      }
    };

    checkPermissionsAndInitialize();
  }, [onScanError]);


  useEffect(() => {
    if (hasPermission === true && !scannerRef.current) {
      const html5QrcodeScanner = new window.Html5QrcodeScanner(
        readerId,
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return {
                width: qrboxSize,
                height: qrboxSize,
            };
          },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 for camera
        },
        /* verbose= */ false
      );
      
      const successCallback = (decodedText: string, result: any) => {
        if(scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
        onScanSuccess(decodedText);
      };

      html5QrcodeScanner.render(successCallback, onScanError);
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error: any) => {
          // On ignore l'erreur "not found", qui arrive quand le composant est démonté trop vite
          if (error.name !== "NotAllowedError" && error.name !== "NotFoundError") {
            console.error("Failed to clear html5QrcodeScanner.", error);
          }
        });
        scannerRef.current = null;
      }
    };
  }, [hasPermission, onScanSuccess, onScanError]);

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Vérification de la caméra...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
       <Alert variant="destructive">
          <CameraOff className="h-4 w-4" />
          <AlertTitle>Accès à la caméra refusé</AlertTitle>
          <AlertDescription>
            Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur pour scanner un QR code.
          </AlertDescription>
        </Alert>
    );
  }

  return <div id={readerId} className="w-full" />;
};

export default QrScanner;
