
"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { getClient, getClients, getRestaurant, getRestaurants, saveClient, saveRestaurant } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';

export default function ReferralPage() {
  const { session, isLoading } = useSession();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [restaurants, setRestaurants] = useState<{[id: string]: Restaurant}>({});
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [selectedRestoId, setSelectedRestoId] = useState('');

  useEffect(() => {
    if (session) {
      const currentClient = getClient(session.id);
      setClient(currentClient);
      setRestaurants(getRestaurants());
    }
  }, [session]);

  const isCircularReferral = (potentialReferrerId: string, currentClientId: string, restoId: string, allClients: {[id: string]: Client}): boolean => {
    let parentId = allClients[currentClientId]?.cards[restoId]?.referrerInfo?.referrerId;
    let currentId = currentClientId;

    // We go up the sponsorship chain
    while (parentId) {
      if (parentId === potentialReferrerId) {
        return true; // Loop detected
      }
      currentId = parentId;
      const parentClient = allClients[currentId];
      parentId = parentClient?.cards[restoId]?.referrerInfo?.referrerId;
    }
    
    return false; // No loop found
  };


  const submitReferralCode = () => {
    if (!client || !selectedRestoId || !referralCodeInput) return;
    const code = referralCodeInput.trim().toUpperCase();

    const restaurant = getRestaurant(selectedRestoId);
    if (!restaurant) return;
    
    if (client.cards[selectedRestoId]?.referralCode === code) {
      toast({ title: "Vous ne pouvez pas vous parrainer vous-même.", variant: 'destructive' });
      return;
    }
    
    const allClients = getClients();
    const referrerId = Object.keys(allClients).find(id => allClients[id].cards[selectedRestoId]?.referralCode === code);

    if (referrerId) {
      const referrer = getClient(referrerId);
      if (!referrer) return;

      if (isCircularReferral(client.id, referrerId, selectedRestoId, allClients)) {
          toast({ title: "Parrainage impossible", description: "Vous ne pouvez pas parrainer quelqu'un qui est dans votre chaîne de parrainage.", variant: 'destructive' });
          return;
      }

      const updatedClient = { ...client };
      if (!updatedClient.cards[selectedRestoId]) {
         updatedClient.cards[selectedRestoId] = {
           stamps: 0,
           referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
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
      
      saveClient(client.id, updatedClient);
      
      // Update restaurant stats immediately on code validation
      const resto = getRestaurant(selectedRestoId);
      if(resto) {
        resto.referralsCount = (resto.referralsCount || 0) + 1;
        saveRestaurant(selectedRestoId, resto); 
      }

      setClient(updatedClient);
      toast({ title: "Parrain validé !", description: `Votre bonus de ${referrer.name} pour ${restaurant.name} sera activé lors de votre prochain tampon.` });
      setSelectedRestoId('');
      setReferralCodeInput('');
    } else {
      toast({ title: "Code parrain inconnu", description: "Ce code n'est pas valide pour le restaurant sélectionné.", variant: 'destructive' });
    }
  };

  if (isLoading || !client) {
    return <div className="p-4 text-center">Chargement...</div>;
  }
  
  // Restaurants where client has a card but no referrer yet
  const restaurantsAvailableForReferral = Object.values(getRestaurants())
      .filter(resto => !client.cards[resto.id]?.referrerInfo);


  const hasCards = client && Object.keys(client.cards).length > 0;

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
          {Object.keys(client.cards).map(restoId => {
            const card = client.cards[restoId];
            if (card.referrerInfo) {
              return (
                <p key={restoId} className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                  Parrainage de {card.referrerInfo.referrerName} activé pour {restaurants[restoId]?.name} ! Vous recevrez votre récompense lors de votre prochain tampon.
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
