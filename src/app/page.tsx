
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
import { useAuth } from '@/firebase';
import { 
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [restoEmail, setRestoEmail] = useState('');
  const [restoPassword, setRestoPassword] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bgImage = placeholderImages[0];

  const handleRestoSignUp = async () => {
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
    } catch (error: any) {
      let description = "Une erreur est survenue lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.";
      }
      toast({ title: 'Erreur d\'inscription', description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoSignIn = async () => {
    const email = restoEmail.trim().toLowerCase();
    const password = restoPassword.trim();
    if (!email || !password) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let description = "Une erreur est survenue lors de la connexion.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "L'adresse e-mail ou le mot de passe est incorrect.";
      }
      toast({ title: 'Erreur de connexion', description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = (emailForReset: string) => {
    const email = emailForReset.trim().toLowerCase();
    if (!email) {
      toast({ title: "Adresse e-mail requise", description: "Veuillez entrer une adresse e-mail pour réinitialiser le mot de passe.", variant: "destructive" });
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
  
  const handleClientSignUp = async () => {
    const email = clientEmail.trim().toLowerCase();
    const password = clientPassword.trim();
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const clientNameFromEmail = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      const newClient: Client = {
          id: user.uid,
          name: clientNameFromEmail,
          email: email,
          cards: {},
      };
      await saveClient(user.uid, newClient);
    } catch (error: any) {
      let description = "Une erreur est survenue lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.";
      }
      toast({ title: 'Erreur d\'inscription', description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClientSignIn = async () => {
    const email = clientEmail.trim().toLowerCase();
    const password = clientPassword.trim();
    if (!email || !password) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let description = "Une erreur est survenue lors de la connexion.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "L'adresse e-mail ou le mot de passe est incorrect.";
      }
      toast({ title: 'Erreur de connexion', description, variant: 'destructive' });
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
                disabled={isLoading}
              />
              <Input 
                id="auth-resto-password" 
                type="password"
                placeholder="Mot de passe" 
                value={restoPassword}
                onChange={(e) => setRestoPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleRestoSignIn} className="w-full font-semibold bg-gray-800 text-white hover:bg-gray-700" disabled={isLoading}>
                  {isLoading ? "Chargement..." : "Se connecter"}
                </Button>
                 <Button onClick={handleRestoSignUp} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end hover:opacity-90 transition-opacity" disabled={isLoading}>
                  {isLoading ? "Chargement..." : "S'inscrire"}
                </Button>
              </div>
              <div className="text-center">
                <Button variant="link" className="text-xs text-gray-500 h-auto p-0" onClick={() => handlePasswordReset(restoEmail)} disabled={isLoading}>
                  Mot de passe oublié ?
                </Button>
              </div>
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
                id="auth-client-email" 
                type="email"
                placeholder="Adresse e-mail" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                disabled={isLoading}
              />
              <Input 
                id="auth-client-password" 
                type="password"
                placeholder="Mot de passe" 
                value={clientPassword}
                onChange={(e) => setClientPassword(e.target.value)}
                disabled={isLoading}
              />
               <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleClientSignIn} className="w-full font-semibold bg-gray-800 text-white hover:bg-gray-700" disabled={isLoading}>
                  {isLoading ? "Chargement..." : "Se connecter"}
                </Button>
                 <Button onClick={handleClientSignUp} variant="secondary" className="w-full font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300" disabled={isLoading}>
                  {isLoading ? "Chargement..." : "S'inscrire"}
                </Button>
              </div>
              <div className="text-center">
                <Button variant="link" className="text-xs text-gray-500 h-auto p-0" onClick={() => handlePasswordReset(clientEmail)} disabled={isLoading}>
                  Mot de passe oublié ?
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    