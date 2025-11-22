import { Check, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface StampGridProps {
  stamps: number;
  totalStamps: number;
  hasImage?: boolean;
}

export function StampGrid({ stamps, totalStamps, hasImage = false }: StampGridProps) {
  const gridColsClass = `grid-cols-${Math.min(totalStamps, 12)}`; // Tailwind needs full class names

  return (
    <div className={cn("grid gap-2", `grid-cols-5`)}>
      {Array.from({ length: totalStamps }).map((_, i) => {
        const stampNumber = i + 1;
        const isFilled = stampNumber <= stamps;
        const isReward = stampNumber === totalStamps;
        
        return (
          <div 
            key={stampNumber} 
            className={cn(
              "stamp", 
              "aspect-square rounded-full border-2 flex items-center justify-center text-lg",
              isFilled && "filled border-none text-white", 
              isReward && !isFilled && "reward border-accent text-accent bg-amber-100",
              isFilled ? 'bg-primary' : 'bg-gray-50 border-dashed border-gray-300 text-gray-400',
              hasImage && "border-white/40 text-white/70 bg-white/10",
              hasImage && isFilled && "bg-primary text-white",
              hasImage && isReward && !isFilled && "border-accent text-accent bg-amber-100/80"
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
