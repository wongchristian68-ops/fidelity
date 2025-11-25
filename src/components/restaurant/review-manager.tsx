
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Restaurant, Review } from '@/lib/types';
import { getRecentReviews, saveReviewResponse } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquareQuote, Star, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiGenerateReviewResponse } from '@/app/restaurant/actions';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewManagerProps {
  restaurant: Restaurant;
}

export function ReviewManager({ restaurant }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null); // Holds the ID of the review being processed
  const { toast } = useToast();

  const fetchReviews = useCallback(() => {
    setIsLoading(true);
    const recentReviews = getRecentReviews(restaurant.id);
    setReviews(recentReviews);
    setIsLoading(false);
  }, [restaurant.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleGenerateResponse = async (review: Review) => {
    setIsGenerating(review.id);
    try {
      const response = await aiGenerateReviewResponse({
        restaurantName: restaurant.name,
        reviewText: review.text,
        reviewRating: review.rating,
        reviewLanguage: review.language
      });
      
      // Save the response (mocked)
      saveReviewResponse(restaurant.id, review.id, response.response);
      
      // Update the state to show the new response
      setReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === review.id ? { ...r, aiResponse: response.response } : r
        )
      );

      toast({
        title: "Réponse générée !",
        description: "La réponse à l'avis a été rédigée par l'IA.",
      });

    } catch (error) {
      toast({
        title: "Erreur IA",
        description: "Impossible de générer une réponse.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <MessageSquareQuote />
            Gestion des Avis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Chargement des avis...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <MessageSquareQuote />
          Gestion des Avis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-center text-gray-500 py-4">
            Aucun avis récent trouvé.
          </p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="border-t pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{review.author}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(review.timestamp, { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2 italic">"{review.text}"</p>
              
              <div className="mt-4">
                {review.aiResponse ? (
                  <div>
                    <label className="text-xs font-bold text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3"/>
                        RÉPONSE SUGGÉRÉE PAR L'IA
                    </label>
                    <Textarea 
                      value={review.aiResponse}
                      readOnly
                      className="mt-1 bg-green-50 border-green-200 text-sm"
                    />
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleGenerateResponse(review)}
                    disabled={isGenerating === review.id}
                    size="sm"
                  >
                    {isGenerating === review.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      "Générer une réponse"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
