
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/hooks/use-user';

type RealtorRatingProps = {
  realtorId: string;
  realtorName: string;
  currentRating?: number;
  viewOnly?: boolean;
};

export function RealtorRating({ realtorId, realtorName, currentRating = 0, viewOnly = false }: RealtorRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  
  const handleRatingSubmit = async () => {
    if (!user || !selectedRating || selectedRating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Update the profile with a new positive rating
      const { data, error } = await supabase
        .from('profiles')
        .select('positive_ratings')
        .eq('id', realtorId)
        .single();
        
      if (error) {
        throw error;
      }
      
      const currentRatings = data?.positive_ratings || 0;
      
      await supabase
        .from('profiles')
        .update({ positive_ratings: currentRatings + 1 })
        .eq('id', realtorId);
      
      toast({
        title: "Avaliação enviada",
        description: `Você avaliou ${realtorName} com ${selectedRating} estrelas.`,
      });
      
      setSelectedRating(0);
      
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStar = (position: number) => {
    const filled = viewOnly 
      ? position <= currentRating
      : position <= (hoveredRating || selectedRating);
      
    return (
      <Star
        key={position}
        size={viewOnly ? 16 : 24}
        className={`
          transition-all 
          ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          ${!viewOnly && 'cursor-pointer hover:scale-110'}
        `}
        onClick={() => {
          if (!viewOnly) setSelectedRating(position);
        }}
        onMouseEnter={() => {
          if (!viewOnly) setHoveredRating(position);
        }}
        onMouseLeave={() => {
          if (!viewOnly) setHoveredRating(0);
        }}
      />
    );
  };
  
  return (
    <div className="flex flex-col items-center">
      {viewOnly ? (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map(pos => renderStar(pos))}
          {currentRating > 0 && (
            <span className="text-sm text-gray-600 ml-1">
              ({currentRating})
            </span>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map(pos => renderStar(pos))}
          </div>
          
          <Button 
            size="sm" 
            disabled={selectedRating === 0 || isSubmitting}
            onClick={handleRatingSubmit}
          >
            {isSubmitting ? "Enviando..." : "Avaliar corretor"}
          </Button>
        </>
      )}
    </div>
  );
}
