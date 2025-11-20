"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { getRestaurant, saveRestaurant } from '@/lib/db';
import type { Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCodeDisplay } from '@/components/restaurant/qr-code';
import { LogOut, Sparkles, Stamp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiSuggestReward } from './actions';

export default function RestaurantPage() {
  const { session, isLoading, logout } = useSession();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [rewardInput, setRewardInput] = useState('');
  const [googleLinkInput, setGoogleLinkInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const currentRestaurant = getRestaurant(session.id);
      setRestaurant(currentRestaurant);
      setRewardInput(currentRestaurant?.reward || '');
      setGoogleLinkInput(currentRestaurant?.googleLink || '');
    }
  }, [session]);
  
  const handleSaveConfig = () => {
    if (restaurant) {
      const updatedRestaurant = { 
        ...restaurant, 
        reward: rewardInput,
        googleLink: googleLinkInput 
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
      setRewardInput(result);
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

  const qrCodeValue = JSON.stringify({ type: 'stamp', restoId: restaurant.id });

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
              <QrCodeDisplay value={qrCodeValue} />
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">QR Code Unique</p>
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
            <CardTitle className="font-headline">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Récompense (pour 10 tampons)</label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={rewardInput}
                  onChange={(e) => setRewardInput(e.target.value)}
                  placeholder="Ex: Dessert offert" />
                <Button onClick={handleAiSuggest} disabled={isAiLoading} variant="outline" className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200">
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
            <Button onClick={handleSaveConfig} className="w-full font-semibold bg-gradient-to-br from-primary to-primary-gradient-end">
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
