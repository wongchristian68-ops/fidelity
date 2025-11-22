
"use client";

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useSession } from '@/hooks/use-session';
import { getRestaurant, saveRestaurant, deleteRestaurant, getClients } from '@/lib/db';
import type { Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCodeDisplay } from '@/components/restaurant/qr-code';
import { LogOut, Sparkles, Stamp, Users, KeyRound, RefreshCw, AlertTriangle, Upload, Trash2, Gift, Users2 } from 'lucide-react';
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

export default function RestaurantPage() {
  const { session, isLoading, logout } = useSession();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loyaltyRewardInput, setLoyaltyRewardInput] = useState('');
  const [referralRewardInput, setReferralRewardInput] = useState('');
  const [googleLinkInput, setGoogleLinkInput] = useState('');
  const [cardImageUrlInput, setCardImageUrlInput] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeClients, setActiveClients] = useState(0);

  useEffect(() => {
    if (session) {
      const currentRestaurant = getRestaurant(session.id);
      setRestaurant(currentRestaurant);
      setLoyaltyRewardInput(currentRestaurant?.loyaltyReward || '');
      setReferralRewardInput(currentRestaurant?.referralReward || '');
      setGoogleLinkInput(currentRestaurant?.googleLink || '');
      setCardImageUrlInput(currentRestaurant?.cardImageUrl || null);
      setPinInput(currentRestaurant?.pin || '');

      const allClients = Object.values(getClients());
      const clientsWithCard = allClients.filter(client => client.cards[session.id]);
      setActiveClients(clientsWithCard.length);
    }
  }, [session]);

  const generateNewQrCode = () => {
    if (restaurant) {
      const newValue = uuidv4();
      const newExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
      const updatedRestaurant = { 
        ...restaurant, 
        qrCodeValue: newValue,
        qrCodeExpiry: newExpiry
      };
      saveRestaurant(restaurant.id, updatedRestaurant);
      setRestaurant(updatedRestaurant);
      toast({ title: 'Nouveau QR Code généré', description: 'Ce code est valable 24h.' });
    }
  };

  useEffect(() => {
    if (restaurant && (!restaurant.qrCodeValue || !restaurant.qrCodeExpiry || Date.now() > restaurant.qrCodeExpiry)) {
      generateNewQrCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);


  const handleSaveConfig = () => {
    if (restaurant) {
      let pinUpdated = false;
      if (restaurant.pinEditable && pinInput.length === 4 && pinInput !== restaurant.pin) {
        if (pinInput === '1234') {
          toast({ title: 'Erreur', description: 'Le nouveau PIN ne peut pas être "1234".', variant: 'destructive' });
          return;
        }
        pinUpdated = true;
      }

      const updatedRestaurant = { 
        ...restaurant, 
        loyaltyReward: loyaltyRewardInput,
        referralReward: referralRewardInput,
        googleLink: googleLinkInput,
        cardImageUrl: cardImageUrlInput || '',
        pin: pinUpdated ? pinInput : restaurant.pin,
        pinEditable: pinUpdated ? false : restaurant.pinEditable,
      };
      saveRestaurant(restaurant.id, updatedRestaurant);
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

  const handleDeleteAccount = () => {
    if (!restaurant) return;
    deleteRestaurant(restaurant.id);
    logout();
  };

  if (isLoading || !restaurant) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  const isQrCodeExpired = restaurant.qrCodeExpiry && Date.now() > restaurant.qrCodeExpiry;
  const qrCodeValue = JSON.stringify({ type: 'stamp', restoId: restaurant.id, value: restaurant.qrCodeValue });
  const rewardsUnlocked = Math.floor(restaurant.stampsGiven / 10);

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
              {restaurant.qrCodeValue ? <QrCodeDisplay value={qrCodeValue} /> : <p>Génération...</p>}
            </div>
            {isQrCodeExpired && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> QR Code expiré. Veuillez en générer un nouveau.
              </div>
            )}
            <Button onClick={generateNewQrCode}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Générer un nouveau QR Code
            </Button>
          </CardContent>
        </Card>

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
                <div className="text-2xl font-bold">{rewardsUnlocked}</div>
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
              <label className="text-xs font-semibold text-gray-500 uppercase">Récompense de fidélité (pour 10 tampons)</label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={loyaltyRewardInput}
                  onChange={(e) => setLoyaltyRewardInput(e.target.value)}
                  placeholder="Ex: Dessert offert" />
                <Button onClick={() => handleAiSuggest('loyalty')} disabled={isAiLoading} variant="outline" className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Récompense de parrainage</label>
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
              <label className="text-xs font-semibold text-gray-500 uppercase">Lien Google Maps pour avis</label>
              <Input
                value={googleLinkInput}
                onChange={(e) => setGoogleLinkInput(e.target.value)}
                className="mt-1"
                placeholder="https://g.page/..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Image de la carte</label>
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
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Code PIN
                </label>
                <Input 
                    type="password"
                    value={pinInput}
                    maxLength={4}
                    onChange={(e) => e.target.value.match(/^\d{0,4}$/) && setPinInput(e.target.value)}
                    className="mt-1 font-mono tracking-widest"
                    disabled={!restaurant.pinEditable}
                />
                {!restaurant.pinEditable && <p className="text-xs text-gray-500 mt-1">Votre code PIN ne peut plus être modifié.</p>}
                 {restaurant.pinEditable && <p className="text-xs text-gray-500 mt-1">Vous ne pouvez changer votre PIN qu'une seule fois.</p>}
            </div>
             <div className="pt-4 border-t">
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

    