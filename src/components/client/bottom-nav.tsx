"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, QrCode, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/client/cards", icon: Wallet, label: "Cartes" },
  { href: "/client/scan", icon: QrCode, label: "Scan" },
  { href: "/client/referral", icon: Gift, label: "Parrainage" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.label === "Scan") {
            return (
              <Link href={item.href} key={item.href} className="flex-1 flex justify-center">
                <div className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center -mt-8 shadow-lg border-4 border-background transform hover:scale-105 transition-transform">
                  <item.icon className="w-7 h-7" />
                </div>
              </Link>
            );
          }
          return (
            <Link href={item.href} key={item.href} className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 text-xs text-gray-500",
              isActive && "text-primary font-semibold"
            )}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
