
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
import { GoogleIcon } from '@/components/icons/google-icon';
import { Trophy } from "lucide-react";
import type { Restaurant } from '@/lib/types';

interface RewardModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export function RewardModal({ restaurant, onClose }: RewardModalProps) {
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm text-center p-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
        <DialogHeader className="pt-10 px-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <DialogTitle className="text-2xl font-bold font-headline text-center">Félicitations !</DialogTitle>
          <DialogDescription className="text-center">
            Vous avez débloqué : <span className="font-bold text-orange-600">{restaurant.loyaltyReward}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 space-y-4 pb-6">
           <div className="bg-gray-100 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Aidez-nous à grandir</p>
                <p className="text-sm text-gray-600">Votre avis compte énormément. Un petit mot sur Google nous aiderait beaucoup !</p>
            </div>
        </div>
        <DialogFooter className="flex-col space-y-3 p-6 bg-gray-50">
          <Button asChild className="w-full font-bold shadow-lg shadow-blue-200" disabled={!restaurant.googleLink}>
            <a href={restaurant.googleLink || '#'} target="_blank" rel="noopener noreferrer">
              <GoogleIcon className="w-4 h-4 mr-2" />
              Laisser un avis sur Google
            </a>
          </Button>
          <Button variant="ghost" onClick={onClose} className="text-gray-500">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
