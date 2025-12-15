
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UtensilsIcon } from '@/components/icons/utensils-icon';
import { getClient, getRestaurant, saveRestaurant, getClients, saveClient, getRestaurants } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useAuth } from '@/firebase/provider';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [restoEmail, setRestoEmail] = useState('');
  const [restoPassword, setRestoPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const bgImage = placeholderImages[0];


  const handleRestoLogin = () => {
    const email = restoEmail.trim().toLowerCase();
    const password = restoPassword.trim();

    if (!email || !password) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit comporter au moins 6 caractères.', variant: 'destructive' });
      return;
    }
    
    // As we don't have Firebase Auth, we'll simulate the logic.
    // In a real scenario, this would call Firebase Auth methods.
    let restaurants = Object.values(getRestaurants());
    let restaurant = restaurants.find(r => r.email === email);
    
    if (restaurant) {
      // Login - we can't check password, so we just log in
      sessionStorage.setItem('session', JSON.stringify({ id: restaurant.id, role: 'resto', name: restaurant.name }));
      router.push('/restaurant');
    } else {
      // Register
      const restaurantNameFromEmail = email.split('@')[0];
      const id = 'resto_' + uuidv4();
      
      const newRestaurant: Restaurant = {
        id,
        name: restaurantNameFromEmail,
        email: email,
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
      saveRestaurant(id, newRestaurant);
      sessionStorage.setItem('session', JSON.stringify({ id: newRestaurant.id, role: 'resto', name: newRestaurant.name }));
      router.push('/restaurant');
    }
  };

  const handlePasswordReset = () => {
    const email = restoEmail.trim().toLowerCase();
    if (!email) {
      toast({ title: "Adresse e-mail requise", description: "Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.", variant: "destructive" });
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({ title: "E-mail de réinitialisation envoyé", description: "Veuillez consulter votre boîte de réception pour réinitialiser votre mot de passe." });
      })
      .catch((error) => {
        let description = "Une erreur est survenue.";
        if (error.code === 'auth/user-not-found') {
            description = "Aucun compte n'est associé à cette adresse e-mail.";
        }
        toast({ title: "Erreur", description, variant: "destructive" });
      });
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
    <div className="relative min-h-screen flex flex-col justify-center bg-gray-900 p-6">
      <Image 
        src={bgImage.imageUrl} 
        alt={bgImage.description} 
        fill
        className="object-cover"
        data-ai-hint={bgImage.imageHint}
      />
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <UtensilsIcon className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-white font-headline">Fidélité & Partage</h1>
          <p className="text-gray-300 mt-2">Fidélité & Parrainage Simplifiés</p>
        </div>

        <div className="space-y-4">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Espace Restaurateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                id="auth-resto-email" 
                type="email"
                placeholder="Adresse e-mail" 
                value={restoEmail}
                onChange={(e) => setRestoEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRestoLogin()}
              />
              <Input 
                id="auth-resto-password" 
                type="password"
                placeholder="Mot de passe" 
                value={restoPassword}
                onChange={(e) => setRestoPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRestoLogin()}
              />
              <Button onClick={handleRestoLogin} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end hover:opacity-90 transition-opacity">
                Gérer mon Restaurant
              </Button>
              <div className="text-center">
                <Button variant="link" className="text-xs text-gray-500 h-auto p-0" onClick={handlePasswordReset}>
                  Mot de passe oublié ?
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center pt-2">
                Créez un compte ou connectez-vous.
              </p>
            </CardContent>
          </Card>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-500"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-500"></div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm">
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
    </div>
  );
}
