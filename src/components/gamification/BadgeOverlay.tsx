
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type BadgeOverlayProps = {
  imageUrl?: string;
  name?: string;
  level: number;
  showBadge: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function BadgeOverlay({ 
  imageUrl, 
  name, 
  level, 
  showBadge, 
  size = 'md' 
}: BadgeOverlayProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const sizeClass = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  };
  
  const badgeSizeClass = {
    sm: 'w-4 h-4 text-[8px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-10 h-10 text-sm'
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClass[size]} border-2 border-gray-200`}>
        <AvatarImage 
          src={imageUrl} 
          alt={name || 'User'} 
          onLoad={() => setIsLoaded(true)}
        />
        <AvatarFallback className="text-2xl">
          {name ? name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      
      {showBadge && (
        <div 
          className={`absolute bottom-0 right-0 flex items-center justify-center ${badgeSizeClass[size]} rounded-full bg-blue-600 text-white font-bold border-2 border-white shadow-sm animate-fade-in`}
        >
          {level}
        </div>
      )}
    </div>
  );
}
