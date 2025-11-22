"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UtensilsIcon } from '@/components/icons/utensils-icon';
import { getClient, getRestaurant, saveRestaurant, getClients, saveClient } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [restoName, setRestoName] = useState('');
  const [restoPin, setRestoPin] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const handleRestoLogin = () => {
    const name = restoName.trim();
    const pin = restoPin.trim();

    if (!name || !pin) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    const id = 'resto_' + name.toLowerCase().replace(/\s+/g, '_');
    let restaurant = getRestaurant(id);
    let isNewRestaurant = false;

    if (restaurant) {
      // Login
      if (restaurant.pin !== pin) {
        toast({ title: 'Erreur', description: 'Code PIN incorrect.', variant: 'destructive' });
        return;
      }
    } else {
      // Register
      if (pin !== '1234') {
        toast({ title: 'Erreur', description: 'Le code PIN pour un nouveau restaurant doit être "1234".', variant: 'destructive' });
        return;
      }
      isNewRestaurant = true;
      restaurant = {
        id,
        name,
        pin: pin,
        pinEditable: true,
        loyaltyReward: 'Surprise du Chef',
        stampsRequiredForReward: 10,
        referralReward: 'Boisson offerte',
        googleLink: '',
        stampsGiven: 0,
        referralsCount: 0,
        rewardsGiven: 0,
        qrCodeValue: null,
        qrCodeExpiry: null,
      };
      saveRestaurant(id, restaurant);
    }
    
    // For new restaurants, use the newly created object for session
    const sessionRestaurant = restaurant;
    sessionStorage.setItem('session', JSON.stringify({ id: sessionRestaurant!.id, role: 'resto', name: sessionRestaurant!.name }));
    router.push('/restaurant');
  };

  const handleClientLogin = () => {
    const name = clientName.trim();
    const phone = clientPhone.trim();

    if (!name || !phone) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }
    
    let client = Object.values(getClients()).find(c => c.phone === phone);

    if (client) {
      // Login
      if(client.name !== name) {
        toast({ title: 'Erreur', description: 'Ce numéro est déjà associé à un autre prénom.', variant: 'destructive' });
        return;
      }
    } else {
      // Register
      const id = 'client_' + Date.now();
      client = {
        id,
        name,
        phone,
        cards: {},
      };
      saveClient(id, client);
    }
    sessionStorage.setItem('session', JSON.stringify({ id: client.id, role: 'client', name }));
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
            <Input 
              id="auth-resto-pin" 
              type="password"
              placeholder="Code PIN à 4 chiffres" 
              value={restoPin}
              maxLength={4}
              onChange={(e) => setRestoPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRestoLogin()}
            />
            <Button onClick={handleRestoLogin} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end hover:opacity-90 transition-opacity">
              Gérer mon Restaurant
            </Button>
            <p className="text-xs text-gray-500 text-center pt-2">
              Créez un compte ou connectez-vous.
            </p>
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
             <Input 
              id="auth-client-phone" 
              type="tel"
              placeholder="Numéro de téléphone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
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
