
import React from 'react';
import { Check, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Profile } from '@/services/auth';

export type Mission = {
  id: string;
  level: number;
  name: string;
  description: string;
  action: string;
  actionUrl: string;
  requirement: {
    type: 'properties' | 'ads' | 'ratings' | 'custom';
    count: number;
  };
};

const missions: Mission[] = [
  {
    id: 'level1',
    level: 1,
    name: 'Novo Corretor',
    description: 'Comece sua jornada no Movvi!',
    action: 'Cadastrar meu 1º imóvel',
    actionUrl: '/create-listing',
    requirement: { type: 'properties', count: 1 }
  },
  {
    id: 'level2',
    level: 2,
    name: 'Corretor Ativo',
    description: 'Demonstre que você está construindo seu portfólio de imóveis',
    action: 'Ver meus imóveis',
    actionUrl: '/profile?tab=properties',
    requirement: { type: 'properties', count: 10 }
  },
  {
    id: 'level3',
    level: 3,
    name: 'Anunciante Iniciante',
    description: 'Destaque seu primeiro imóvel com um anúncio patrocinado',
    action: 'Criar anúncio agora',
    actionUrl: '/profile?tab=properties&sponsor=true',
    requirement: { type: 'ads', count: 1 }
  },
  {
    id: 'level4',
    level: 4,
    name: 'Corretor Confiável',
    description: 'Sua carteira de imóveis está crescendo!',
    action: 'Cadastrar imóveis',
    actionUrl: '/create-listing',
    requirement: { type: 'properties', count: 35 }
  },
  {
    id: 'level5',
    level: 5,
    name: 'Corretor Popular',
    description: 'Deixe seus clientes falarem por você!',
    action: 'Ver minhas avaliações',
    actionUrl: '/profile?tab=ratings',
    requirement: { type: 'ratings', count: 4 }
  },
  {
    id: 'level6',
    level: 6,
    name: 'Destaque Regional',
    description: 'Torne-se um especialista na sua região',
    action: 'Cadastrar imóveis',
    actionUrl: '/create-listing',
    requirement: { type: 'properties', count: 50 }
  },
  {
    id: 'level7',
    level: 7,
    name: 'Corretor de Elite',
    description: 'Alcance o nível mais alto de reconhecimento!',
    action: 'Acompanhar meu progresso',
    actionUrl: '/profile?tab=missions',
    requirement: { type: 'custom', count: 0 }
  }
];

type MissionsListProps = {
  profile: Profile;
  onCloseDialog?: () => void;
};

export function MissionsList({ profile, onCloseDialog }: MissionsListProps) {
  const isMissionCompleted = (mission: Mission) => {
    if (!profile || !profile.completed_missions) return false;
    return profile.completed_missions.includes(mission.id);
  };

  const isMissionUnlocked = (mission: Mission) => {
    if (mission.level === 1) return true;
    const prevMission = missions.find(m => m.level === mission.level - 1);
    if (!prevMission) return true;
    return isMissionCompleted(prevMission);
  };

  const checkProgressForMission = (mission: Mission): number => {
    if (!profile) return 0;
    
    switch (mission.requirement.type) {
      case 'properties':
        return Math.min(100, ((profile.property_count || 0) / mission.requirement.count) * 100);
      case 'ads':
        return Math.min(100, ((profile.ad_count || 0) / mission.requirement.count) * 100);
      case 'ratings':
        return Math.min(100, ((profile.positive_ratings || 0) / mission.requirement.count) * 100);
      case 'custom':
        if (mission.level === 7) {
          // Special case for level 7
          const propertyProgress = Math.min(1, ((profile.property_count || 0) / 100));
          const adProgress = Math.min(1, ((profile.ad_count || 0) / 5));
          const ratingProgress = Math.min(1, ((profile.positive_ratings || 0) / 10));
          return Math.min(100, ((propertyProgress + adProgress + ratingProgress) / 3) * 100);
        }
        return 0;
      default:
        return 0;
    }
  };

  const getRequirementText = (mission: Mission): string => {
    switch (mission.requirement.type) {
      case 'properties':
        return `${profile?.property_count || 0}/${mission.requirement.count} imóveis`;
      case 'ads':
        return `${profile?.ad_count || 0}/${mission.requirement.count} anúncios`;
      case 'ratings':
        return `${profile?.positive_ratings || 0}/${mission.requirement.count} avaliações`;
      case 'custom':
        if (mission.level === 7) {
          return `${profile?.property_count || 0}/100 imóveis, ${profile?.ad_count || 0}/5 anúncios, ${profile?.positive_ratings || 0}/10 avaliações`;
        }
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      {missions.map((mission) => {
        const completed = isMissionCompleted(mission);
        const unlocked = isMissionUnlocked(mission);
        const progress = checkProgressForMission(mission);
        
        return (
          <Card 
            key={mission.id}
            className={`p-4 relative overflow-hidden transition-all ${
              !unlocked ? 'opacity-50' : ''
            } ${
              completed ? 'border-green-500 bg-green-50' : ''
            }`}
          >
            {/* Progress bar */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all" 
              style={{ width: `${progress}%` }}
            />
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold mr-2">
                  {mission.level}
                </div>
                <h3 className="text-lg font-semibold">{mission.name}</h3>
              </div>
              
              {completed && (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1" size={18} />
                  <span className="text-sm font-medium">Concluído</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-2">{mission.description}</p>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm font-medium text-gray-500">
                {getRequirementText(mission)}
              </div>
              
              <Button 
                variant="default"
                size="sm"
                className={`${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!unlocked}
                onClick={() => {
                  if (onCloseDialog) onCloseDialog();
                  window.location.href = mission.actionUrl;
                }}
              >
                {completed ? (
                  <div className="flex items-center">
                    <Trophy size={16} className="mr-2" />
                    Concluído
                  </div>
                ) : mission.action}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
