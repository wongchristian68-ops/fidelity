
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/client/qr-scanner';
import type { Client, Restaurant, StampQrCode, ClientCard } from '@/lib/types';
import { getClient, getRestaurant, saveClient, saveRestaurant } from '@/lib/db';
import { useSession } from '@/hooks/use-session';
import { textToSpeech } from '../actions';
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useSession();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [audioUrl]);

  const playNotification = async (text: string) => {
    try {
       const audioDataUri = await textToSpeech(text);
       setAudioUrl(audioDataUri);
    } catch (e) {
       console.error("Audio notification failed", e);
    }
  }

  const rewardReferrer = async (referrerId: string, restoId: string, reward: string, referredClientName: string) => {
    const referrer = await getClient(referrerId);
    if (referrer) {
      if (!referrer.pendingReferralRewards) {
        referrer.pendingReferralRewards = [];
      }
      referrer.pendingReferralRewards.push({
        id: uuidv4(),
        restoId: restoId,
        reward: reward,
        referredClientName: referredClientName,
      });
      await saveClient(referrer.id, referrer);
    }
  };

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

    clientCard.scannedCodes.push(qrCodeValue);
    
    let newStamps = clientCard.stamps + 1;
    const stampsRequired = resto.stampsRequiredForReward || 10;
    
    // Check for referral reward on first stamp for this card
    if (clientCard.referrerInfo && !clientCard.referrerInfo.isActivated) {
        await rewardReferrer(clientCard.referrerInfo.referrerId, restoId, clientCard.referrerInfo.reward, client.name);
        clientCard.referrerInfo.isActivated = true;
        
        toast({
            title: `Bonus de parrainage activé !`,
            description: `Grâce à ${clientCard.referrerInfo.referrerName}, vous bénéficiez de : ${resto.referralReward}. Montrez ce message pour en profiter.`,
            duration: 10000,
        });

        // The referral is now consumed, so we can remove the info.
        delete client.cards[restoId].referrerInfo;
    }


    if (newStamps >= stampsRequired) {
      client.cards[restoId].stamps = 0; 
      resto.rewardsGiven = (resto.rewardsGiven || 0) + 1;
      sessionStorage.setItem('rewardUnlocked', restoId);
      await playNotification(`Félicitations ! Vous avez débloqué: ${resto.loyaltyReward}`);
    } else {
       client.cards[restoId].stamps = newStamps;
       await playNotification(`Tampon ajouté chez ${resto.name}.`);
    }

    await saveClient(client.id, client);
    
    resto.stampsGiven = (resto.stampsGiven || 0) + 1;
    await saveRestaurant(restoId, resto);
    
    toast({ title: "Succès!", description: `Tampon ajouté chez ${resto.name}!` });
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
       {audioUrl && <audio ref={audioRef} src={audioUrl} />}
    </div>
  );
}
