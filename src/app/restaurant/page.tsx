"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { getRestaurant, saveRestaurant } from '@/lib/db';
import type { Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCodeDisplay } from '@/components/restaurant/qr-code';
import { LogOut, Sparkles, Stamp, Users, KeyRound, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiSuggestReward } from './actions';
import { v4 as uuidv4 } from 'uuid';

export default function RestaurantPage() {
  const { session, isLoading, logout } = useSession();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loyaltyRewardInput, setLoyaltyRewardInput] = useState('');
  const [referralBonusInput, setReferralBonusInput] = useState('2');
  const [googleLinkInput, setGoogleLinkInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const currentRestaurant = getRestaurant(session.id);
      setRestaurant(currentRestaurant);
      setLoyaltyRewardInput(currentRestaurant?.loyaltyReward || '');
      setReferralBonusInput(String(currentRestaurant?.referralBonusStamps || 2));
      setGoogleLinkInput(currentRestaurant?.googleLink || '');
      setPinInput(currentRestaurant?.pin || '');
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
        referralBonusStamps: parseInt(referralBonusInput, 10) || 2,
        googleLink: googleLinkInput,
        pin: pinUpdated ? pinInput : restaurant.pin,
        pinEditable: pinUpdated ? false : restaurant.pinEditable,
      };
      saveRestaurant(restaurant.id, updatedRestaurant);
      setRestaurant(updatedRestaurant);
      toast({ title: "Configuration sauvegardée !" });
    }
  };

  const handleAiSuggest = async () => {
    if (!restaurant) return;
    setIsAiLoading(true);
    try {
      const result = await aiSuggestReward(restaurant.name);
      setLoyaltyRewardInput(result);
      toast({ title: '✨ Suggestion IA', description: 'Une nouvelle idée de récompense a été générée.' });
    } catch (error) {
      toast({ title: 'Erreur IA', description: 'Impossible de générer une suggestion.', variant: 'destructive' });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading || !restaurant) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  const isQrCodeExpired = restaurant.qrCodeExpiry && Date.now() > restaurant.qrCodeExpiry;
  const qrCodeValue = JSON.stringify({ type: 'stamp', restoId: restaurant.id, value: restaurant.qrCodeValue });

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

      <main className="p-4 space-y-6">
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

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <Stamp className="text-orange-500 mb-2 w-8 h-8" />
              <div className="text-2xl font-bold">{restaurant.stampsGiven}</div>
              <div className="text-xs text-gray-500">Tampons donnés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="text-purple-500 mb-2 w-8 h-8" />
              <div className="text-2xl font-bold">{restaurant.referralsCount}</div>
              <div className="text-xs text-gray-500">Parrainages actifs</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Configuration des Récompenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Récompense de fidélité (pour 10 tampons)</label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={loyaltyRewardInput}
                  onChange={(e) => setLoyaltyRewardInput(e.target.value)}
                  placeholder="Ex: Dessert offert" />
                <Button onClick={handleAiSuggest} disabled={isAiLoading} variant="outline" className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Bonus parrainage (en tampons)</label>
              <Input
                type="number"
                value={referralBonusInput}
                onChange={(e) => setReferralBonusInput(e.target.value)}
                className="mt-1"
                placeholder="Ex: 2"
              />
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
            <Button onClick={handleSaveConfig} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end">
              Enregistrer les Modifications
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
