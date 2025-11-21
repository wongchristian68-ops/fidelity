"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { getClient, getRestaurants } from "@/lib/db";
import type { Client, Restaurant } from "@/lib/types";
import { LoyaltyCard } from "@/components/client/loyalty-card";
import { RewardModal } from "@/components/modals/reward-modal";
import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CardsPage() {
  const { session, isLoading, logout } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [restaurants, setRestaurants] = useState<{ [id: string]: Restaurant }>({});
  const [rewardRestaurant, setRewardRestaurant] = useState<Restaurant | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setClient(getClient(session.id));
      setRestaurants(getRestaurants());

      const rewardRestoId = sessionStorage.getItem('rewardUnlocked');
      if (rewardRestoId) {
        const resto = getRestaurants()[rewardRestoId];
        if (resto) {
          setRewardRestaurant(resto);
          sessionStorage.removeItem('rewardUnlocked');
        }
      }
    }
  }, [session]);
  
  if (isLoading || !client) {
    return <div className="p-4 text-center">Chargement...</div>;
  }
  
  const cardIds = Object.keys(client.cards);
  const totalPoints = cardIds.reduce((acc, id) => acc + (client.cards[id]?.stamps || 0), 0);

  const handleModalClose = () => {
    setRewardRestaurant(null);
    // Force a re-fetch of client data to show reset card
    if (client) {
      setClient(getClient(client.id));
    }
  };
  
  return (
    <div>
      <header className="bg-white p-6 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-headline">Bonjour, {client.name}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mes points</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-orange-600 font-semibold">{totalPoints} pts</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-gray-500 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      <main className="p-4 space-y-4">
        {cardIds.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="mx-auto text-gray-300 w-12 h-12 mb-4" />
            <p className="text-gray-500">Aucune carte de fidélité.</p>
            <Button variant="link" onClick={() => router.push('/client/scan')} className="text-primary font-semibold mt-2">
              Scanner un code pour commencer
            </Button>
          </div>
        ) : (
          cardIds.map(restoId => {
            const resto = restaurants[restoId];
            const clientCard = client.cards[restoId];
            if (!resto || !clientCard) return null;
            return <LoyaltyCard key={restoId} restaurant={resto} clientCard={clientCard} />;
          })
        )}
      </main>

      {rewardRestaurant && (
        <RewardModal
          restaurant={rewardRestaurant}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
