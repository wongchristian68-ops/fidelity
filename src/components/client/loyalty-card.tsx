import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { StampGrid } from './stamp-grid';
import type { Restaurant, ClientCard } from '@/lib/types';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

interface LoyaltyCardProps {
  restaurant: Restaurant;
  clientCard: ClientCard;
}

export function LoyaltyCard({ restaurant, clientCard }: LoyaltyCardProps) {
  const { toast } = useToast();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(clientCard.referralCode);
    toast({ title: 'Code copié !', description: `Code pour ${restaurant.name} copié.` });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">{restaurant.name}</CardTitle>
          <CardDescription>Prochaine récompense: <strong className="text-orange-600">{restaurant.loyaltyReward}</strong></CardDescription>
        </div>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">{clientCard.stamps}/10</span>
      </CardHeader>
      <CardContent>
        <StampGrid stamps={clientCard.stamps} />
      </CardContent>
      <CardFooter className="bg-gray-50/50 p-3 flex-col items-start text-xs border-t">
        <p className="text-gray-500 mb-2">
          Parrainez un ami et recevez <strong className="text-purple-600">{restaurant.referralBonusStamps} tampons bonus</strong> chez {restaurant.name} !
        </p>
        <div className="flex w-full items-center gap-2">
          <div className="flex-1 bg-white border rounded-md p-2 text-center font-mono text-gray-700 tracking-widest">
            {clientCard.referralCode}
          </div>
          <Button size="sm" variant="ghost" onClick={copyReferralCode}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
