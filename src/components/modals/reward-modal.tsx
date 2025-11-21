"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GoogleIcon } from '@/components/icons/google-icon';
import { Sparkles, Trophy } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { aiDraftReview } from '@/app/client/actions';
import type { Restaurant } from '@/lib/types';

interface RewardModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export function RewardModal({ restaurant, onClose }: RewardModalProps) {
  const { toast } = useToast();
  const [review, setReview] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiDraft = async () => {
    setIsAiLoading(true);
    try {
      const result = await aiDraftReview(restaurant.name);
      setReview(result);
    } catch (error) {
      toast({ title: 'Erreur IA', description: 'Impossible de générer un brouillon.', variant: 'destructive' });
    } finally {
      setIsAiLoading(false);
    }
  };
  
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
        <div className="px-6 space-y-4">
           <div className="bg-gray-100 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Aidez-nous à grandir</p>
                <p className="text-sm text-gray-600 mb-3">Votre avis compte énormément. Voulez-vous laisser un petit mot sur Google ?</p>
                
                <div className="space-y-2">
                    <Textarea 
                      id="review-draft" 
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="J'ai adoré..."
                      className="bg-white h-24"
                    />
                    <Button onClick={handleAiDraft} disabled={isAiLoading} variant="ghost" className="text-xs text-purple-600 font-semibold h-auto p-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      M'aider à rédiger
                    </Button>
                </div>
            </div>
        </div>
        <DialogFooter className="flex-col space-y-3 p-6 bg-gray-50">
          <Button asChild className="w-full font-bold shadow-lg shadow-blue-200" disabled={!restaurant.googleLink}>
            <a href={restaurant.googleLink || '#'} target="_blank" rel="noopener noreferrer">
              <GoogleIcon className="w-4 h-4 mr-2" />
              Publier mon avis
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
