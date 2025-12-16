
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, X } from "lucide-react";
import type { Restaurant, PendingReferralReward } from "@/lib/types";

interface ReferralRewardModalProps {
  reward: PendingReferralReward & { restaurant: Restaurant };
  onUse: () => void;
  onDismiss: () => void;
}

export function ReferralRewardModal({ reward, onUse, onDismiss }: ReferralRewardModalProps) {
  
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-sm text-center p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-500"></div>
        <DialogHeader className="pt-10 px-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <PartyPopper className="w-12 h-12 text-purple-500" />
          </div>
          <DialogTitle className="text-2xl font-bold font-headline text-center">Bonus de Parrainage !</DialogTitle>
          <DialogDescription className="text-center text-base">
            Félicitations ! Votre ami(e) <span className="font-bold text-purple-600">{reward.referredClientName}</span> a rejoint {reward.restaurant.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 space-y-2 pb-6">
           <div className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Vous avez gagné :</p>
                <p className="text-lg font-bold text-gray-800">{reward.reward}</p>
            </div>
        </div>
        <DialogFooter className="flex-col space-y-2 p-6 bg-gray-50">
          <Button onClick={onUse} className="w-full font-bold shadow-lg shadow-green-200 bg-green-500 hover:bg-green-600">
            Utiliser maintenant
          </Button>
          <Button variant="ghost" onClick={onDismiss} className="text-gray-500 flex items-center gap-2">
            <X className="w-4 h-4"/>
            Ignorer pour le moment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
