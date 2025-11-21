import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { StampGrid } from './stamp-grid';
import type { Restaurant, ClientCard } from '@/lib/types';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const cardStyle = restaurant.cardImageUrl ? {
    backgroundImage: `url(${restaurant.cardImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};
  
  const hasImage = !!restaurant.cardImageUrl;

  return (
    <Card className="relative overflow-hidden" style={cardStyle}>
      {hasImage && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0"></div>}
      <div className="relative z-10">
        <CardHeader className={cn("flex-row items-start justify-between pb-2", hasImage && 'text-white')}>
          <div>
            <CardTitle className="text-lg font-bold">{restaurant.name}</CardTitle>
            <CardDescription className={cn(hasImage && 'text-gray-200')}>
              Prochaine récompense: <strong className={cn("font-bold", hasImage ? 'text-orange-300' : 'text-orange-600')}>{restaurant.loyaltyReward}</strong>
            </CardDescription>
          </div>
          <span className={cn("text-xs bg-gray-100/80 px-2 py-1 rounded-md text-gray-800 font-medium", hasImage && "bg-white/90")}>
            {clientCard.stamps}/10
          </span>
        </CardHeader>
        <CardContent>
          <StampGrid stamps={clientCard.stamps} hasImage={hasImage} />
        </CardContent>
        <CardFooter className="bg-gray-50/10 p-3 flex-col items-start text-xs border-t border-white/20">
          <p className={cn("mb-2", hasImage ? "text-gray-200" : "text-gray-500")}>
            Parrainez un ami et recevez : <strong className={cn("font-semibold", hasImage ? "text-purple-300" : "text-purple-600")}>{restaurant.referralReward}</strong> !
          </p>
          <div className="flex w-full items-center gap-2">
            <div className={cn("flex-1 rounded-md p-2 text-center font-mono tracking-widest", hasImage ? "bg-black/20 text-white" : "bg-white border text-gray-700")}>
              {clientCard.referralCode}
            </div>
            <Button size="sm" variant="ghost" onClick={copyReferralCode} className={cn(hasImage && "text-white hover:bg-white/20 hover:text-white")}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
