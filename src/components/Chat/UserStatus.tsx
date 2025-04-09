
import { useState, useEffect } from "react";
import { isUserOnline, subscribeToUserPresence } from "@/services/chat";
import { formatTimeAgo } from "@/lib/utils";

interface UserStatusProps {
  userId: string | null | undefined;
  lastSeen: string | null | undefined;
}

export default function UserStatus({ userId, lastSeen }: UserStatusProps) {
  const [online, setOnline] = useState<boolean>(false);
  
  useEffect(() => {
    // Only proceed if we have a real userId (not for anonymous users)
    if (userId) {
      // Initial status
      if (lastSeen) {
        setOnline(isUserOnline(lastSeen));
      }
      
      // Subscribe to real-time status updates
      const unsubscribe = subscribeToUserPresence(userId, (isOnline) => {
        setOnline(isOnline);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [userId, lastSeen]);
  
  // If no userId is provided (anonymous user), show a default status
  if (!userId) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-500">Visitante</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-xs">
      <span 
        className={`inline-block w-2 h-2 rounded-full ${
          online ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <span className="truncate">
        {online ? "Online" : lastSeen ? `Visto ${formatTimeAgo(new Date(lastSeen))}` : "Offline"}
      </span>
    </div>
  );
}
