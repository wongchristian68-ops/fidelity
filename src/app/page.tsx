
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UtensilsIcon } from '@/components/icons/utensils-icon';
import { saveRestaurant, saveClient, getClient } from '@/lib/db';
import type { Client, Restaurant } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useAuth } from '@/firebase/provider';
import { 
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';

export default function AuthPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const [restoEmail, setRestoEmail] = useState('');
  const [restoPassword, setRestoPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bgImage = placeholderImages[0];


  const handleRestoLogin = async () => {
    const email = restoEmail.trim().toLowerCase();
    const password = restoPassword.trim();

    if (!email || !password) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
        toast({ title: 'Mot de passe trop court', description: 'Le mot de passe doit faire au moins 6 caractères.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        
        if (methods.length > 0) {
            // User exists, sign in
            await signInWithEmailAndPassword(auth, email, password);
            // AuthRedirect will handle navigation
        } else {
            // User doesn't exist, register
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const restaurantNameFromEmail = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            const newRestaurant: Restaurant = {
                id: user.uid,
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
            await saveRestaurant(user.uid, newRestaurant);
            // AuthRedirect will handle navigation
        }
    } catch (error: any) {
        let description = "Une erreur est survenue.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "L'adresse e-mail ou le mot de passe est incorrect.";
        } else if (error.code === 'auth/email-already-in-use') {
            description = "Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.";
        }
        toast({ title: 'Erreur de connexion', description, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordReset = () => {
    const email = restoEmail.trim().toLowerCase();
    if (!email) {
      toast({ title: "Adresse e-mail requise", description: "Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
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
      })
      .finally(() => setIsLoading(false));
  };

  const handleClientLogin = async () => {
    const name = clientName.trim();
    const phone = clientPhone.trim();

    if (!name || !phone) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      let client = await getClient(user.uid);

      if (client) {
        // Client already exists, update their info if changed
        if(client.name !== name || client.phone !== phone) {
            client.name = name;
            client.phone = phone;
            await saveClient(user.uid, client);
        }
      } else {
        // New client, create a profile
        const newClient: Client = {
          id: user.uid,
          name,
          phone,
          cards: {},
        };
        await saveClient(user.uid, newClient);
      }
      // AuthRedirect will handle navigation to /client
    } catch(error) {
        console.error("Client anonymous login failed", error);
        toast({ title: 'Erreur de connexion', description: "Impossible de se connecter. Veuillez réessayer.", variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
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
                disabled={isLoading}
              />
              <Input 
                id="auth-resto-password" 
                type="password"
                placeholder="Mot de passe" 
                value={restoPassword}
                onChange={(e) => setRestoPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRestoLogin()}
                disabled={isLoading}
              />
              <Button onClick={handleRestoLogin} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end hover:opacity-90 transition-opacity" disabled={isLoading}>
                {isLoading ? "Chargement..." : "Se connecter / S'inscrire"}
              </Button>
              <div className="text-center">
                <Button variant="link" className="text-xs text-gray-500 h-auto p-0" onClick={handlePasswordReset} disabled={isLoading}>
                  Mot de passe oublié ?
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center pt-2">
                Entrez vos identifiants pour vous connecter ou créer un nouveau compte.
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
                disabled={isLoading}
              />
              <Input 
                id="auth-client-phone" 
                type="tel"
                placeholder="Numéro de téléphone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleClientLogin()}
                disabled={isLoading}
              />
              <Button onClick={handleClientLogin} variant="secondary" className="w-full font-semibold bg-gray-800 text-white hover:bg-gray-700" disabled={isLoading}>
                {isLoading ? "Chargement..." : "Accéder à mes cartes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
