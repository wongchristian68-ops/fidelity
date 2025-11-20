"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { UtensilsIcon } from '@/components/icons/utensils-icon';
import { saveClient, getClient, getRestaurant, saveRestaurant } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [restoName, setRestoName] = useState('');
  const [clientName, setClientName] = useState('');

  const handleRestoLogin = () => {
    const name = restoName.trim();
    if (!name) {
      toast({ title: 'Erreur', description: 'Veuillez entrer un nom de restaurant.', variant: 'destructive' });
      return;
    }
    const id = 'resto_' + name.toLowerCase().replace(/\s+/g, '_');
    const existing = getRestaurant(id);
    if (!existing) {
      const newRestaurant: Restaurant = {
        id,
        name,
        reward: 'Surprise du Chef',
        googleLink: '',
        stampsGiven: 0,
        referralsCount: 0,
      };
      saveRestaurant(id, newRestaurant);
    }
    sessionStorage.setItem('session', JSON.stringify({ id, role: 'resto', name }));
    router.push('/restaurant');
  };

  const handleClientLogin = () => {
    const name = clientName.trim();
    if (!name) {
      toast({ title: 'Erreur', description: 'Veuillez entrer votre prénom.', variant: 'destructive' });
      return;
    }
    const id = 'client_' + name.toLowerCase().replace(/\s+/g, '_');
    const existing = getClient(id);
    if (!existing) {
      const newClient: Client = {
        id,
        name,
        cards: {},
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referrer: null,
      };
      saveClient(id, newClient);
    }
    sessionStorage.setItem('session', JSON.stringify({ id, role: 'client', name }));
    router.push('/client');
  };

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center bg-gray-50">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <UtensilsIcon className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 font-headline">StampJoy</h1>
        <p className="text-gray-500 mt-2">Fidélité & Parrainage Simplifiés</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Espace Restaurateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              id="auth-resto-name" 
              placeholder="Nom de votre restaurant" 
              value={restoName}
              onChange={(e) => setRestoName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRestoLogin()}
            />
            <Button onClick={handleRestoLogin} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end hover:opacity-90 transition-opacity">
              Gérer mon Restaurant
            </Button>
          </CardContent>
        </Card>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Espace Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              id="auth-client-name" 
              placeholder="Votre prénom"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClientLogin()}
            />
            <Button onClick={handleClientLogin} variant="secondary" className="w-full font-semibold bg-gray-800 text-white hover:bg-gray-700">
              Accéder à mes cartes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
