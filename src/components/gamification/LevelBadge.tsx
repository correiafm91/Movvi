
import React from 'react';
import { Badge } from '@/components/ui/badge';

type LevelBadgeProps = {
  level: number;
  showIcon?: boolean;
  className?: string;
};

const getLevelName = (level: number): string => {
  switch(level) {
    case 1: return 'Novo Corretor';
    case 2: return 'Corretor Ativo';
    case 3: return 'Anunciante Iniciante';
    case 4: return 'Corretor Confiável';
    case 5: return 'Corretor Popular';
    case 6: return 'Destaque Regional';
    case 7: return 'Corretor de Elite';
    default: return 'Novo Corretor';
  }
};

export function LevelBadge({ level, showIcon = false, className = '' }: LevelBadgeProps) {
  return (
    <Badge
      className={`bg-blue-600 text-white hover:bg-blue-700 px-2 py-1 ${className}`}
    >
      {showIcon && (
        <span className="mr-1 font-bold">{level}</span>
      )}
      {getLevelName(level)}
    </Badge>
  );
}
