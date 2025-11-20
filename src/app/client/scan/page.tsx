"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/client/qr-scanner';
import type { Client, Restaurant, StampQrCode } from '@/lib/types';
import { getClient, getRestaurant, saveClient, saveRestaurant } from '@/lib/db';
import { useSession } from '@/hooks/use-session';


export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useSession();

  const handleScanSuccess = (decodedText: string) => {
    if (!session || session.role !== 'client') return;
    
    try {
      const data: StampQrCode = JSON.parse(decodedText);
      if (data.type === 'stamp' && data.restoId) {
        addStamp(data.restoId);
      } else {
        toast({ title: "Code QR invalide", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Code QR invalide", description: "Ce code n'est pas reconnu par StampJoy.", variant: "destructive" });
    }
  };

  const addStamp = (restoId: string) => {
    if (!session) return;
    
    const client = getClient(session.id);
    const resto = getRestaurant(restoId);

    if (!client || !resto) {
      toast({ title: "Erreur", description: "Restaurant ou client non trouvé.", variant: "destructive" });
      return;
    }

    const currentStamps = client.cards[restoId] || 0;
    let newStamps = currentStamps + 1;
    let justUnlockedReward = false;

    if (newStamps >= 10) {
      justUnlockedReward = true;
      // The reward is claimed, stamps reset
      client.cards[restoId] = 0; 
      sessionStorage.setItem('rewardUnlocked', restoId);
    } else {
       client.cards[restoId] = newStamps;
    }
    
    saveClient(client.id, client);
    
    resto.stampsGiven = (resto.stampsGiven || 0) + 1;

    // First stamp with a referrer?
    if (currentStamps === 0 && client.referrer) {
       rewardReferrer(client.referrer, restoId);
       resto.referralsCount = (resto.referralsCount || 0) + 1;
    }

    saveRestaurant(restoId, resto);
    
    toast({ title: "Succès!", description: `Tampon ajouté chez ${resto.name}!` });
    router.push('/client/cards');
  };

  const rewardReferrer = (referralCode: string, restoId: string) => {
    // Find the referrer by code
    // This is inefficient but fine for a demo
    const clients = Object.values(getClient(null) || {});
    const referrer = clients.find(c => c.referralCode === referralCode);

    if (referrer) {
      referrer.cards[restoId] = (referrer.cards[restoId] || 0) + 2; // +2 bonus stamps
      saveClient(referrer.id, referrer);
      console.log(`Parrain ${referrer.name} récompensé avec 2 tampons!`);
    }
  };


  const handleScanError = (errorMessage: string) => {
    // console.error(errorMessage);
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
            <p className="text-center text-xs text-gray-500 mt-4">Cherchez le QR code à la caisse du restaurant</p>
        </CardContent>
       </Card>
    </div>
  );
}
