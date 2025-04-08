
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/services/auth';
import { toast } from '@/components/ui/use-toast';
import type { Profile } from '@/services/auth';

type BadgeCustomizerProps = {
  profile: Profile;
  onClose: () => void;
  onUpdate: (profile: Profile) => void;
};

export function BadgeCustomizer({ profile, onClose, onUpdate }: BadgeCustomizerProps) {
  const [showBadge, setShowBadge] = useState(profile.display_badge || false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveBadgePreference = async () => {
    setIsLoading(true);
    try {
      const { success } = await updateProfile({
        display_badge: showBadge
      });
      
      if (success) {
        toast({
          title: "Preferência salva",
          description: showBadge 
            ? "Seu selo de nível será exibido em seu perfil." 
            : "Seu selo de nível não será exibido em seu perfil.",
        });
        
        onUpdate({
          ...profile,
          display_badge: showBadge
        });
        
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar preferência:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua preferência.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold text-center">Personalizar Foto de Perfil</h2>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 border-2 border-gray-200">
            <AvatarImage src={profile.photo_url || undefined} />
            <AvatarFallback className="text-4xl">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          
          {showBadge && (
            <div className="absolute bottom-0 right-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold border-2 border-white shadow-md animate-fade-in">
              {profile.level_id || 1}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showBadge"
            checked={showBadge}
            onChange={(e) => setShowBadge(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="showBadge" className="text-lg">
            Exibir selo de nível no perfil
          </label>
        </div>
        
        <p className="text-sm text-gray-500 text-center max-w-md">
          O selo mostra seu nível atual aos outros usuários da plataforma. 
          Você pode ativá-lo ou desativá-lo a qualquer momento.
        </p>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSaveBadgePreference} 
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Salvar preferência"}
        </Button>
      </div>
    </div>
  );
}
