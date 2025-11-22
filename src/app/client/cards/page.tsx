
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { getClient, getRestaurants, deleteClient, saveClient } from "@/lib/db";
import type { Client, Restaurant } from "@/lib/types";
import { LoyaltyCard } from "@/components/client/loyalty-card";
import { RewardModal } from "@/components/modals/reward-modal";
import { LogOut, Wallet, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export default function CardsPage() {
  const { session, isLoading, logout } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [restaurants, setRestaurants] = useState<{ [id: string]: Restaurant }>({});
  const [rewardRestaurant, setRewardRestaurant] = useState<Restaurant | null>(null);
  const router = useRouter();
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (session) {
      const currentClient = getClient(session.id);
      setClient(currentClient);
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
  
  useEffect(() => {
    if (client?.pendingReferralRewards && client.pendingReferralRewards.length > 0) {
      const reward = client.pendingReferralRewards[0];
      const resto = restaurants[reward.restoId];

      if (!resto) return;

      const handleUse = () => {
        toast({
          title: "Récompense utilisée",
          description: `Montrez ce message chez ${resto.name} pour recevoir: ${reward.reward}`,
        });
        removeReward(reward.id);
        dismiss(); // Dismiss the original toast
      };

      const handleDismiss = () => {
        removeReward(reward.id);
        dismiss(); // Dismiss the original toast
      };
      
      toast({
        title: `Nouveau bonus de parrainage !`,
        description: `Félicitations ! ${reward.referredClientName} a utilisé votre code chez ${resto.name}. Vous avez gagné: "${reward.reward}".`,
        duration: Infinity,
        action: (
          <div className="flex flex-col gap-2 w-full mt-2">
            <ToastAction altText="Utiliser" onClick={handleUse} className="w-full justify-center">
              Utiliser
            </ToastAction>
            <ToastAction altText="Ignorer" onClick={handleDismiss} className="w-full bg-transparent text-gray-500 hover:bg-gray-100 justify-center">
              Ignorer
            </ToastAction>
          </div>
        ),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, restaurants]);

  const removeReward = (rewardId: string) => {
    if (!client) return;
    const updatedClient = {
      ...client,
      pendingReferralRewards: client.pendingReferralRewards?.filter(r => r.id !== rewardId)
    };
    saveClient(client.id, updatedClient);
    setClient(updatedClient);
  };

  const handleDeleteAccount = () => {
    if (!client) return;
    deleteClient(client.id);
    logout();
  };
  
  if (isLoading || !client) {
    return <div className="p-4 text-center">Chargement...</div>;
  }
  
  const cardIds = Object.keys(client.cards);

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

       <div className="p-4 mt-8 text-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive"/>
                Êtes-vous absolument sûr ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes vos données, y compris vos cartes de fidélité et vos points, seront définitivement supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                Oui, supprimer mon compte
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs text-gray-400 mt-2">Conformément au RGPD</p>
      </div>

      {rewardRestaurant && (
        <RewardModal
          restaurant={rewardRestaurant}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
