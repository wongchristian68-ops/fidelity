
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/client/qr-scanner';
import type { Client, Restaurant, StampQrCode, RestaurantUpdate } from '@/lib/types';
import { getClient, getRestaurant, saveClient, updateRestaurant } from '@/lib/db';
import { useSession } from '@/hooks/use-session';
import { useState } from 'react';
import { playChime } from '@/lib/audio';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing || !session || session.role !== 'client') return;
    setIsProcessing(true);
    
    try {
      const data: StampQrCode = JSON.parse(decodedText);
      const resto = await getRestaurant(data.restoId);

      if (!resto) {
        toast({ title: "Restaurant Inconnu", variant: "destructive" });
        return;
      }
      if (resto.qrCodeValue !== data.value || (resto.qrCodeExpiry && Date.now() > resto.qrCodeExpiry)) {
        toast({ title: "Code QR invalide ou expiré", variant: "destructive" });
        return;
      }
      
      if (data.type === 'stamp' && data.restoId) {
        await addStamp(data.restoId, resto, data.value);
      } else {
        toast({ title: "Code QR invalide", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Code QR illisible", description: "Ce code n'est pas reconnu par StampJoy.", variant: "destructive" });
    } finally {
        router.push('/client/cards');
    }
  };

  const addStamp = async (restoId: string, resto: Restaurant, qrCodeValue: string) => {
    if (!session) return;
    
    let client = await getClient(session.id);
    if (!client) {
      toast({ title: "Erreur", description: "Client non trouvé.", variant: "destructive" });
      return;
    }
    
    const isNewCard = !client.cards[restoId];

    if (isNewCard) {
      client.cards[restoId] = {
        stamps: 0,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referrerInfo: client.cards[restoId]?.referrerInfo || null,
        scannedCodes: []
      };
    }
    
    const clientCard = client.cards[restoId];

    if (!clientCard.scannedCodes) {
      clientCard.scannedCodes = [];
    }

    if (clientCard.scannedCodes.includes(qrCodeValue)) {
      toast({ title: "QR Code déjà utilisé", description: "Vous avez déjà scanné ce code.", variant: "destructive" });
      return;
    }

    playChime();
    clientCard.scannedCodes.push(qrCodeValue);
    
    let newStamps = clientCard.stamps + 1;
    const stampsRequired = resto.stampsRequiredForReward || 10;
    let restaurantUpdates: RestaurantUpdate = {};

    // Check for referral reward on first stamp for this card
    if ((isNewCard || clientCard.stamps === 0) && clientCard.referrerInfo && !clientCard.referrerInfo.isActivated) {
      restaurantUpdates.referralsCount = (resto.referralsCount || 0) + 1;
      clientCard.referrerInfo.isActivated = true;
      
      toast({
          title: `Bonus de parrainage activé !`,
          description: `Grâce à ${clientCard.referrerInfo.referrerName}, vous bénéficiez de : ${resto.referralReward}. Montrez ce message pour en profiter.`,
          duration: 10000,
      });
    }

    if (newStamps >= stampsRequired) {
      client.cards[restoId].stamps = 0;
      restaurantUpdates.rewardsGiven = (resto.rewardsGiven || 0) + 1;
      sessionStorage.setItem('rewardUnlocked', restoId);
      toast({ title: `Félicitations !`, description: `Vous avez débloqué: ${resto.loyaltyReward}` });
    } else {
      client.cards[restoId].stamps = newStamps;
      restaurantUpdates.stampsGiven = (resto.stampsGiven || 0) + 1;
      toast({ title: "Succès!", description: `Tampon ajouté chez ${resto.name}!` });
    }
    
    await saveClient(client.id, client);
    if (Object.keys(restaurantUpdates).length > 0) {
        await updateRestaurant(restoId, restaurantUpdates);
    }
  };

  const handleScanError = (errorMessage: string) => {
     // Les erreurs sont gérées directement dans le composant QrScanner
  };

  return (
    <div className="p-4">
       <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle className="text-center font-bold text-lg font-headline">Scanner un QR Code</CardTitle>
        </CardHeader>
        <CardContent>
            <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
            />
        </CardContent>
       </Card>
    </div>
  );
}
