
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface QrCodeCountdownProps {
  expiryTimestamp: number;
  onExpire: () => void;
}

const calculateTimeLeft = (expiry: number) => {
  const difference = expiry - Date.now();
  if (difference <= 0) return null;

  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const minutes = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0');
  const seconds = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');

  return { hours, minutes, seconds };
};

export function QrCodeCountdown({ expiryTimestamp, onExpire }: QrCodeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryTimestamp));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiryTimestamp);
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        clearInterval(timer);
        setTimeLeft(null);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTimestamp, onExpire]);
  
  const isExpired = !timeLeft;

  return (
    <div className="text-center">
        <p className="text-sm text-gray-500">Temps restant :</p>
        <p className={cn(
            "text-3xl font-bold font-mono tracking-wider",
            isExpired ? "text-red-500" : "text-gray-800"
        )}>
            {isExpired ? "Expiré" : `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`}
        </p>
    </div>
  );
}
