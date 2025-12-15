
"use client";

import { useEffect, useState, useRef, ChangeEvent, useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import { getRestaurant, saveRestaurant, deleteRestaurant, getClients, resetRestaurantStats } from '@/lib/db';
import type { Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCodeDisplay } from '@/components/restaurant/qr-code';
import { QrCodeCountdown } from '@/components/restaurant/qr-code-countdown';
import { LogOut, Sparkles, Stamp, Users, KeyRound, RefreshCw, AlertTriangle, Upload, Trash2, Gift, Users2, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiSuggestReward } from './actions';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { ReviewManager } from '@/components/restaurant/review-manager';

export default function RestaurantPage() {
  const { session, isLoading: isSessionLoading, logout } = useSession();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [loyaltyRewardInput, setLoyaltyRewardInput] = useState('');
  const [stampsRequiredInput, setStampsRequiredInput] = useState(10);
  const [referralRewardInput, setReferralRewardInput] = useState('');
  const [googleLinkInput, setGoogleLinkInput] = useState('');
  const [cardImageUrlInput, setCardImageUrlInput] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeClients, setActiveClients] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchRestaurantData = useCallback(async () => {
    if (session) {
      setIsDataLoading(true);
      const currentRestaurant = await getRestaurant(session.id);
      if (currentRestaurant) {
        setRestaurant(currentRestaurant);
        setNameInput(currentRestaurant.name || '');
        setLoyaltyRewardInput(currentRestaurant.loyaltyReward || '');
        setStampsRequiredInput(currentRestaurant.stampsRequiredForReward || 10);
        setReferralRewardInput(currentRestaurant.referralReward || '');
        setGoogleLinkInput(currentRestaurant.googleLink || '');
        setCardImageUrlInput(currentRestaurant.cardImageUrl || null);

        const allClients = Object.values(await getClients());
        const clientsWithCard = allClients.filter(client => client.cards[session.id]);
        setActiveClients(clientsWithCard.length);
      }
      setIsDataLoading(false);
    }
  }, [session]);
  
  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const generateNewQrCode = useCallback(async () => {
    if (session) {
        let currentRestaurant = await getRestaurant(session.id);
        if (currentRestaurant) {
            const newValue = uuidv4();
            const newExpiry = Date.now() + 24 * 60 * 60 * 1000;
            const updatedRestaurant = { 
                ...currentRestaurant, 
                qrCodeValue: newValue,
                qrCodeExpiry: newExpiry
            };
            await saveRestaurant(currentRestaurant.id, updatedRestaurant);
            setRestaurant(updatedRestaurant);
            toast({ title: 'Nouveau QR Code généré !', description: 'Ce code est valable 24 heures.' });
        }
    }
  }, [session, toast]);

  useEffect(() => {
    if (restaurant && (!restaurant.qrCodeValue || !restaurant.qrCodeExpiry || Date.now() > restaurant.qrCodeExpiry)) {
      generateNewQrCode();
    }
  }, [restaurant, generateNewQrCode]);


  const handleSaveConfig = async () => {
    if (restaurant) {
      const updatedRestaurant = { 
        ...restaurant, 
        name: nameInput,
        loyaltyReward: loyaltyRewardInput,
        stampsRequiredForReward: stampsRequiredInput,
        referralReward: referralRewardInput,
        googleLink: googleLinkInput,
        cardImageUrl: cardImageUrlInput || '',
      };
      await saveRestaurant(restaurant.id, updatedRestaurant);
      setRestaurant(updatedRestaurant);
      toast({ title: "Configuration sauvegardée !" });
    }
  };

  const handleAiSuggest = async (rewardType: 'loyalty' | 'referral') => {
    if (!restaurant) return;
    setIsAiLoading(true);
    try {
      const result = await aiSuggestReward(restaurant.name);
      if (rewardType === 'loyalty') {
        setLoyaltyRewardInput(result);
      } else {
        setReferralRewardInput(result);
      }
      toast({ title: '✨ Suggestion IA', description: 'Une nouvelle idée de récompense a été générée.' });
    } catch (error) {
      toast({ title: 'Erreur IA', description: 'Impossible de générer une suggestion.', variant: 'destructive' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setCardImageUrlInput(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (!restaurant) return;
    await deleteRestaurant(restaurant.id);
    logout();
  };

  const handleResetStats = async () => {
    if (!restaurant) return;
    await resetRestaurantStats(restaurant.id);
    fetchRestaurantData();
    toast({ title: "Statistiques réinitialisées", description: "Les compteurs de campagne ont été remis à zéro." });
  };


  if (isSessionLoading || isDataLoading || !restaurant) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );
  }

  const qrCodeValue = restaurant.qrCodeValue ? JSON.stringify({ type: 'stamp', restoId: restaurant.id, value: restaurant.qrCodeValue }) : '';

  return (
    <div>
      <header className="bg-white p-6 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-headline">{restaurant.name}</h2>
            <p className="text-xs text-gray-500">Tableau de bord</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-gray-500 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-20">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="font-headline">Tampon Digital</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6">Faites scanner ce code au client pour valider un passage.</p>
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4">
              {qrCodeValue ? <QrCodeDisplay value={qrCodeValue} /> : <div className="w-[150px] h-[150px] flex items-center justify-center"><p>Génération...</p></div>}
            </div>
            {restaurant.qrCodeExpiry && (
              <QrCodeCountdown expiryTimestamp={restaurant.qrCodeExpiry} onExpire={generateNewQrCode} />
            )}
            <Button onClick={generateNewQrCode} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Générer un nouveau QR Code
            </Button>
          </CardContent>
        </Card>
        
        <ReviewManager restaurant={restaurant} />

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <Stamp className="text-orange-500 mb-2 w-7 h-7" />
                <div className="text-2xl font-bold">{restaurant.stampsGiven}</div>
                <div className="text-xs text-gray-500">Tampons donnés</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Users2 className="text-blue-500 mb-2 w-7 h-7" />
                <div className="text-2xl font-bold">{activeClients}</div>
                <div className="text-xs text-gray-500">Clients actifs</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Gift className="text-green-500 mb-2 w-7 h-7" />
                <div className="text-2xl font-bold">{restaurant.rewardsGiven}</div>
                <div className="text-xs text-gray-500">Récompenses débloquées</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Users className="text-purple-500 mb-2 w-7 h-7" />
                <div className="text-2xl font-bold">{restaurant.referralsCount}</div>
                <div className="text-xs text-gray-500">Parrainages activés</div>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="restaurant-name" className="text-xs font-semibold text-gray-500 uppercase">Nom du restaurant</Label>
                <Input
                id="restaurant-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Le nom de votre établissement"
                className="mt-1"
                 />
            </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="loyalty-reward" className="text-xs font-semibold text-gray-500 uppercase">Récompense de fidélité</Label>
                    <div className="flex gap-2 mt-1">
                        <Input
                        id="loyalty-reward"
                        value={loyaltyRewardInput}
                        onChange={(e) => setLoyaltyRewardInput(e.target.value)}
                        placeholder="Ex: Dessert offert" />
                        <Button onClick={() => handleAiSuggest('loyalty')} disabled={isAiLoading} variant="outline" className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200">
                            <Sparkles className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div>
                    <Label htmlFor="stamps-required" className="text-xs font-semibold text-gray-500 uppercase">Nb. Tampons</Label>
                    <Input
                        id="stamps-required"
                        type="number"
                        value={stampsRequiredInput}
                        onChange={(e) => setStampsRequiredInput(parseInt(e.target.value, 10) || 1)}
                        className="mt-1"
                        min="1"
                    />
                </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase">Récompense de parrainage</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={referralRewardInput}
                  onChange={(e) => setReferralRewardInput(e.target.value)}
                  className="mt-1"
                  placeholder="Ex: Boisson offerte"
                />
                 <Button onClick={() => handleAiSuggest('referral')} disabled={isAiLoading} variant="outline" className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200 mt-1">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
             <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase">Lien Google Maps pour avis</Label>
              <Input
                value={googleLinkInput}
                onChange={(e) => setGoogleLinkInput(e.target.value)}
                className="mt-1"
                placeholder="https://g.page/..."
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase">Image de la carte</Label>
              <div className="mt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                {cardImageUrlInput ? (
                  <div className="relative group w-full aspect-video rounded-md overflow-hidden border">
                    <Image src={cardImageUrlInput} alt="Aperçu de la carte" fill style={{objectFit: 'cover'}} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="icon" onClick={() => setCardImageUrlInput(null)}>
                        <Trash2 className="w-5 h-5"/>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2"/>
                    Télécharger une image
                  </Button>
                )}
              </div>
            </div>
            <Button onClick={handleSaveConfig} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end !mt-6">
              Enregistrer les Modifications
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Mot de passe
                </Label>
                <p className="text-sm text-gray-600 mt-1">La gestion du mot de passe se fait via les services d'authentification standards (ex: lien "mot de passe oublié" sur la page de connexion).</p>
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Réinitialiser les statistiques
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="text-destructive" />
                      Réinitialiser les statistiques ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Les compteurs de statistiques (tampons, parrainages) seront remises à zéro, mais <strong className="font-bold">les cartes et points de vos clients ne seront pas affectés.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetStats} className="bg-destructive hover:bg-destructive/90">
                      Oui, réinitialiser
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer mon restaurant
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="text-destructive" />
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes les données de votre restaurant, y compris les cartes de vos clients, seront définitivement supprimées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Oui, supprimer mon restaurant
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-gray-400 mt-2 text-center">Conformément au RGPD</p>
             </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
