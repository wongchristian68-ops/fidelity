import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StampGrid } from './stamp-grid';
import type { Restaurant } from '@/lib/types';

interface LoyaltyCardProps {
  restaurant: Restaurant;
  stamps: number;
}

export function LoyaltyCard({ restaurant, stamps }: LoyaltyCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">{restaurant.name}</CardTitle>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">{stamps}/10</span>
      </CardHeader>
      <CardContent>
        <StampGrid stamps={stamps} />
        <div className="text-xs text-gray-500 mt-3">
          <span>Prochaine récompense: <strong className="text-orange-600">{restaurant.reward}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}
