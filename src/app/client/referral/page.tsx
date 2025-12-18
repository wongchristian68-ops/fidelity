
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/hooks/use-session';
import { getClient, getClientsWithReferralCode, getRestaurant, getRestaurants, saveClient, updateRestaurant, getClientsReferredBy } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

interface ReferredClientInfo {
  name: string;
  restaurantName: string;
}

export default function ReferralPage() {
  const { session, isLoading } = useSession();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<{[id: string]: Restaurant}>({});
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [selectedRestoId, setSelectedRestoId] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [referredClients, setReferredClients] = useState<ReferredClientInfo[]>([]);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const [clientData, restaurantsData] = await Promise.all([
          getClient(session.id),
          getRestaurants(),
        ]);
        setClient(clientData);
        setAllRestaurants(restaurantsData);

        if (clientData) {
          const allReferred: ReferredClientInfo[] = [];
          for (const restoId in clientData.cards) {
            const referred = await getClientsReferredBy(session.id, restoId);
            referred.forEach(c => {
              allReferred.push({
                name: c.name,
                restaurantName: restaurantsData[restoId]?.name || 'Restaurant inconnu'
              });
            });
          }
          setReferredClients(allReferred);
        }

        setIsDataLoading(false);
      };
      fetchData();
    }
  }, [session]);

  const submitReferralCode = async () => {
    if (!client || !selectedRestoId || !referralCodeInput) return;
    const code = referralCodeInput.trim().toUpperCase();

    const restaurant = await getRestaurant(selectedRestoId);
    if (!restaurant) return;
    
    if (client.cards[selectedRestoId]?.referralCode === code) {
      toast({ title: "Vous ne pouvez pas vous parrainer vous-même.", variant: 'destructive' });
      return;
    }
    
    const referrers = await getClientsWithReferralCode(code, selectedRestoId);
    const referrer = referrers.length > 0 ? referrers[0] : null;
    const referrerId = referrer?.id;

    if (referrerId && referrer) {
       const updatedClient = { ...client };
      if (!updatedClient.cards[selectedRestoId]) {
         updatedClient.cards[selectedRestoId] = {
           stamps: 0,
           referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
           scannedCodes: [],
           referrerInfo: null
         };
      }
      
      updatedClient.cards[selectedRestoId].referrerInfo = {
        code,
        reward: restaurant.referralReward,
        referrerId: referrerId,
        referrerName: referrer.name,
        isActivated: false, // This will be set to true on first stamp
      }
      
      await saveClient(client.id, updatedClient);
      
      const restoToUpdate = await getRestaurant(selectedRestoId);
      if(restoToUpdate) {
        // This was causing a permission error because a client cannot update a restaurant document.
        // We now use updateRestaurant which should be allowed by security rules for this specific field.
        await updateRestaurant(selectedRestoId, { referralsCount: (restoToUpdate.referralsCount || 0) + 1 });
      }

      setClient(updatedClient);
      toast({ title: "Parrain validé !", description: `Votre bonus de ${referrer.name} pour ${restaurant.name} sera activé lors de votre prochain tampon.` });
      setSelectedRestoId('');
      setReferralCodeInput('');
    } else {
      toast({ title: "Code parrain inconnu", description: "Ce code n'est pas valide pour le restaurant sélectionné.", variant: 'destructive' });
    }
  };

  if (isLoading || isDataLoading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }
  
  const restaurantsAvailableForReferral = Object.values(allRestaurants)
      .filter(resto => !client?.cards[resto.id]?.referrerInfo);

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Parrainer un ami</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Retrouvez vos codes de parrainage directement sur vos cartes de fidélité respectives. Partagez-les pour gagner des récompenses !
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-lg">Mes filleuls</CardTitle>
              <CardDescription>Amis que vous avez parrainés</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <Users className="w-4 h-4"/>
              <span className="font-bold text-lg">{referredClients.length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {referredClients.length > 0 ? (
            <ul className="space-y-2">
              {referredClients.map((c, index) => (
                <li key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-800">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.restaurantName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Vous n'avez pas encore parrainé d'ami.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">J'ai été parrainé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-500">
            Entrez le code de votre parrain et sélectionnez le restaurant associé pour activer votre offre de bienvenue.
          </p>
          <Select
            onValueChange={setSelectedRestoId}
            value={selectedRestoId}
            disabled={restaurantsAvailableForReferral.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurantsAvailableForReferral.length > 0 ? (
                  restaurantsAvailableForReferral.map(resto => (
                    <SelectItem key={resto.id} value={resto.id}>{resto.name}</SelectItem>
                  ))
               ) : (
                 <SelectItem value="none" disabled>Vous avez déjà un parrain pour toutes vos cartes.</SelectItem>
               )
              }
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="CODE"
              className="flex-1 uppercase font-mono"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
              disabled={!selectedRestoId}
            />
            <Button
              onClick={submitReferralCode}
              className="bg-gray-800 text-white font-semibold hover:bg-gray-700"
              disabled={!selectedRestoId || !referralCodeInput}
            >
              Valider
            </Button>
          </div>
          {client && Object.keys(client.cards).map(restoId => {
            const card = client!.cards[restoId];
            if (card.referrerInfo) {
              return (
                <p key={restoId} className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                  Parrainage de {card.referrerInfo.referrerName} activé pour {allRestaurants[restoId]?.name} ! Vous recevrez votre récompense lors de votre prochain tampon.
                </p>
              )
            }
            return null;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
