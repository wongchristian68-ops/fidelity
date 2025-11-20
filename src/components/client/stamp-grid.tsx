import { Check, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface StampGridProps {
  stamps: number;
}

export function StampGrid({ stamps }: StampGridProps) {
  return (
    <div className="stamp-grid">
      {Array.from({ length: 10 }).map((_, i) => {
        const stampNumber = i + 1;
        const isFilled = stampNumber <= stamps;
        const isReward = stampNumber === 10;
        
        return (
          <div key={stampNumber} className={cn("stamp", isFilled && "filled", isReward && "reward")}>
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
