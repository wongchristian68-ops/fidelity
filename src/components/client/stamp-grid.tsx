import { Check, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface StampGridProps {
  stamps: number;
  hasImage?: boolean;
}

export function StampGrid({ stamps, hasImage = false }: StampGridProps) {
  return (
    <div className="stamp-grid">
      {Array.from({ length: 10 }).map((_, i) => {
        const stampNumber = i + 1;
        const isFilled = stampNumber <= stamps;
        const isReward = stampNumber === 10;
        
        return (
          <div 
            key={stampNumber} 
            className={cn(
              "stamp", 
              isFilled && "filled", 
              isReward && "reward",
              hasImage && "border-white/40 text-white/70 bg-white/10",
              hasImage && isFilled && "bg-primary text-white",
              hasImage && isReward && "border-accent text-accent bg-amber-100/80"
            )}
          >
            {isFilled ? (
              <Check className="w-5 h-5" />
            ) : isReward ? (
              <Gift className="w-5 h-5" />
            ) : (
              stampNumber
            )}
          </div>
        );
      })}
    </div>
  );
}
