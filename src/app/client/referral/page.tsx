"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { getClient, getClients, getRestaurants, saveClient } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  
  const submitReferralCode = () => {
    if (!client || !selectedRestoId || !referralCodeInput) return;
    const code = referralCodeInput.trim().toUpperCase();

    if (client.referrer) {
      toast({ title: "Vous avez déjà un parrain.", variant: 'destructive' });
      return;
    }
    
    if (client.cards[selectedRestoId]?.referralCode === code) {
      toast({ title: "Vous ne pouvez pas vous parrainer vous-même.", variant: 'destructive' });
      return;
    }
    
    const allClients = getClients();
    const referrerId = Object.keys(allClients).find(id => allClients[id].cards[selectedRestoId]?.referralCode === code);

    if (referrerId) {
      const updatedClient = { ...client, referrer: { restoId: selectedRestoId, code } };
      saveClient(client.id, updatedClient);
      setClient(updatedClient);
      toast({ title: "Parrain validé !", description: "Votre bonus s'activera lors de votre premier tampon dans ce restaurant." });
    } else {
      toast({ title: "Code parrain inconnu", description: "Ce code n'est pas valide pour le restaurant sélectionné.", variant: 'destructive' });
    }
  };

  if (isLoading || !client) {
    return <div className="p-4 text-center">Chargement...</div>;
  }
  
  const clientHasCards = client && Object.keys(client.cards).length > 0;
  const restaurantsWithCards = clientHasCards ? Object.keys(client.cards).map(id => restaurants[id]).filter(Boolean) : [];

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Parrainer un ami</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Retrouvez vos codes de parrainage directement sur vos cartes de fidélité respectives. Partagez-les pour gagner des tampons bonus !
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
            disabled={!!client.referrer || !clientHasCards}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un restaurant" />
            </SelectTrigger>
            <SelectContent>
              {clientHasCards ? (
                restaurantsWithCards.map(resto => (
                  <SelectItem key={resto.id} value={resto.id}>{resto.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>Scannez d'abord une carte</SelectItem>
              )}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="CODE"
              className="flex-1 uppercase font-mono"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
              disabled={!!client.referrer}
            />
            <Button
              onClick={submitReferralCode}
              className="bg-gray-800 text-white font-semibold hover:bg-gray-700"
              disabled={!!client.referrer || !selectedRestoId || !referralCodeInput}
            >
              Valider
            </Button>
          </div>
          {client.referrer && (
            <p className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
              Parrainage activé ! Vous recevrez votre récompense lors de votre prochain tampon chez {restaurants[client.referrer.restoId]?.name}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
