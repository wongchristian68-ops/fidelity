
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { getClient, getRestaurants, deleteClient, saveClient } from "@/lib/db";
import type { Client, Restaurant } from "@/lib/types";
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
import { CardCarousel } from "@/components/client/card-carousel";
import { ReferralRewardModal } from "@/components/modals/referral-reward-modal";

export default function CardsPage() {
  const { session, isLoading, logout } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [restaurants, setRestaurants] = useState<{ [id: string]: Restaurant }>({});
  const [rewardRestaurant, setRewardRestaurant] = useState<Restaurant | null>(null);
  const [pendingReward, setPendingReward] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const [clientData, restaurantsData] = await Promise.all([
          getClient(session.id),
          getRestaurants(),
        ]);

        setClient(clientData);
        setRestaurants(restaurantsData);
        
        if (clientData?.pendingReferralRewards && clientData.pendingReferralRewards.length > 0) {
          const reward = clientData.pendingReferralRewards[0];
          const resto = restaurantsData[reward.restoId];
          if (resto) {
            setPendingReward({ ...reward, restaurant: resto });
          }
        }
        
        setIsDataLoading(false);

        const rewardRestoId = sessionStorage.getItem('rewardUnlocked');
        if (rewardRestoId && restaurantsData[rewardRestoId]) {
          setRewardRestaurant(restaurantsData[rewardRestoId]);
          sessionStorage.removeItem('rewardUnlocked');
        }
      };
      fetchData();
    }
  }, [session]);
  
  const removeReward = async (rewardId: string) => {
    if (!client) return;
    const updatedClient = {
      ...client,
      pendingReferralRewards: client.pendingReferralRewards?.filter(r => r.id !== rewardId)
    };
    await saveClient(client.id, updatedClient);
    setClient(updatedClient);
    setPendingReward(null);
  };

  const handleDeleteAccount = async () => {
    if (!client) return;
    await deleteClient(client.id);
    logout();
  };
  
  if (isLoading || isDataLoading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }
  
  const cardIds = client ? Object.keys(client.cards) : [];

  const handleModalClose = async () => {
    setRewardRestaurant(null);
    if (client) {
      const updatedClient = await getClient(client.id);
      setClient(updatedClient);
    }
  };
  
  return (
    <div>
      <header className="bg-white p-6 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-headline">Bonjour, {session?.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-gray-500 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      <main className="p-4">
        {cardIds.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="mx-auto text-gray-300 w-12 h-12 mb-4" />
            <p className="text-gray-500">Aucune carte de fidélité.</p>
            <Button variant="link" onClick={() => router.push('/client/scan')} className="text-primary font-semibold mt-2">
              Scanner un code pour commencer
            </Button>
          </div>
        ) : (
          <CardCarousel cards={client!.cards} restaurants={restaurants} />
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
      {pendingReward && (
        <ReferralRewardModal
          reward={pendingReward}
          onUse={() => {
            toast({
              title: "Récompense utilisée",
              description: `Montrez ce message chez ${pendingReward.restaurant.name} pour recevoir: ${pendingReward.reward}`,
            });
            removeReward(pendingReward.id);
          }}
          onDismiss={() => removeReward(pendingReward.id)}
        />
      )}
    </div>
  );
}
