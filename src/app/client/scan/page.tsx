"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/client/qr-scanner';
import type { Client, Restaurant, StampQrCode, ClientCard } from '@/lib/types';
import { getClient, getRestaurant, saveClient, saveRestaurant, getClients } from '@/lib/db';
import { useSession } from '@/hooks/use-session';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useSession();

  const handleScanSuccess = (decodedText: string) => {
    if (!session || session.role !== 'client') return;
    
    try {
      const data: StampQrCode = JSON.parse(decodedText);
      const resto = getRestaurant(data.restoId);

      if (!resto) {
        toast({ title: "Restaurant Inconnu", variant: "destructive" });
        return;
      }
      if (resto.qrCodeValue !== data.value || (resto.qrCodeExpiry && Date.now() > resto.qrCodeExpiry)) {
        toast({ title: "Code QR invalide ou expiré", variant: "destructive" });
        return;
      }
      
      if (data.type === 'stamp' && data.restoId) {
        addStamp(data.restoId, resto);
      } else {
        toast({ title: "Code QR invalide", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Code QR illisible", description: "Ce code n'est pas reconnu par StampJoy.", variant: "destructive" });
    }
  };

  const addStamp = (restoId: string, resto: Restaurant) => {
    if (!session) return;
    
    let client = getClient(session.id);
    if (!client) {
      toast({ title: "Erreur", description: "Client non trouvé.", variant: "destructive" });
      return;
    }

    const isFirstEverStamp = !client.cards[restoId];
    if (isFirstEverStamp) {
      client.cards[restoId] = {
        stamps: 0,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };
    }
    
    const clientCard = client.cards[restoId];
    let newStamps = clientCard.stamps + 1;

    if (newStamps >= 10) {
      // The reward is claimed, stamps reset
      client.cards[restoId].stamps = 0; 
      sessionStorage.setItem('rewardUnlocked', restoId);
    } else {
       client.cards[restoId].stamps = newStamps;
    }
    
    saveClient(client.id, client);
    
    resto.stampsGiven = (resto.stampsGiven || 0) + 1;

    // First stamp with a referrer?
    if (isFirstEverStamp && client.referrer && client.referrer.restoId === restoId) {
       rewardReferrer(client.referrer.code, restoId, client.referrer.reward);
       resto.referralsCount = (resto.referralsCount || 0) + 1;
    }

    saveRestaurant(restoId, resto);
    
    toast({ title: "Succès!", description: `Tampon ajouté chez ${resto.name}!` });
    router.push('/client/cards');
  };

  const rewardReferrer = (referralCode: string, restoId: string, reward: string) => {
    const allClients = getClients();
    const referrerId = Object.keys(allClients).find(id => 
      allClients[id].cards[restoId]?.referralCode === referralCode
    );

    if (referrerId) {
      const referrer = allClients[referrerId];
      if (referrer.cards[restoId]) {
        // Here you would implement how to give the reward.
        // For now, we'll just log it and maybe notify via a toast or a dedicated "rewards" section.
        console.log(`Parrain ${referrer.name} a gagné une récompense: "${reward}"!`);
        // You could save this pending reward on the referrer's object in a future version.
      }
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
