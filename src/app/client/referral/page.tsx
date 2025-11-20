"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { getClient, getClients, saveClient } from '@/lib/db';
import type { Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ReferralPage() {
  const { session, isLoading } = useSession();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  useEffect(() => {
    if (session) {
      const currentClient = getClient(session.id);
      setClient(currentClient);
      if (currentClient?.referrer) {
        setReferralCodeInput(currentClient.referrer);
      }
    }
  }, [session]);

  const copyReferralCode = () => {
    if (client?.referralCode) {
      navigator.clipboard.writeText(client.referralCode);
      toast({ title: 'Code copié !' });
    }
  };

  const submitReferralCode = () => {
    if (!client) return;
    const code = referralCodeInput.trim().toUpperCase();

    if (!code) return;
    if (code === client.referralCode) {
      toast({ title: "Vous ne pouvez pas vous parrainer !", variant: 'destructive' });
      return;
    }
    if (client.referrer) {
      toast({ title: "Vous avez déjà un parrain.", variant: 'destructive' });
      return;
    }

    const allClients = getClients();
    const referrerId = Object.keys(allClients).find(id => allClients[id].referralCode === code);

    if (referrerId) {
      const updatedClient = { ...client, referrer: code };
      saveClient(client.id, updatedClient);
      setClient(updatedClient);
      toast({ title: "Parrain validé !", description: "Offre de bienvenue activée." });
    } else {
      toast({ title: "Code parrain inconnu", variant: 'destructive' });
    }
  };

  if (isLoading || !client) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Parrainer un ami</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-200 text-sm mb-6">
            Gagnez 2 tampons bonus quand votre filleul valide son premier passage !
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 mb-4">
            <p className="text-xs text-purple-200 uppercase tracking-wider mb-1">Votre code parrain</p>
            <div className="text-3xl font-mono font-bold tracking-widest">{client.referralCode}</div>
          </div>
          <Button onClick={copyReferralCode} className="w-full bg-white text-purple-700 font-semibold hover:bg-gray-100">
            Copier mon code
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">J'ai un parrain</CardTitle>
        </CardHeader>
        <CardContent>
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
              disabled={!!client.referrer}
            >
              Valider
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Entrez le code pour gagner une offre de bienvenue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
