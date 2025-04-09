
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/services/chat";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const [sender, setSender] = useState<{ name?: string; photo_url?: string } | null>(null);
  const time = formatTimeAgo(new Date(message.created_at));
  
  // Get sender info if not own message
  useEffect(() => {
    const getSenderInfo = async () => {
      if (!isOwnMessage && message.sender_id) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', message.sender_id)
            .single();
          
          if (data) {
            setSender({
              name: data.name || "Usuário",
              photo_url: data.photo_url
            });
          }
        } catch (error) {
          console.error("Error fetching sender info:", error);
        }
      }
    };
    
    if (message.is_anonymous) {
      setSender({
        name: message.anonymous_name || "Visitante"
      });
    } else {
      getSenderInfo();
    }
  }, [message, isOwnMessage]);
  
  return (
    <div className={cn(
      "flex items-end gap-2",
      isOwnMessage ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwnMessage && (
        <Avatar className="w-8 h-8">
          {sender?.photo_url ? (
            <AvatarImage src={sender.photo_url} />
          ) : message.is_anonymous ? (
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {(message.anonymous_name || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {sender?.name ? sender.name.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      <div className={cn(
        "max-w-[75%]",
        isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800",
        "rounded-lg py-2 px-3"
      )}>
        {!isOwnMessage && !message.is_anonymous && (
          <div className="text-xs font-medium mb-1">
            {sender?.name || "Usuário"}
          </div>
        )}
        {!isOwnMessage && message.is_anonymous && (
          <div className="text-xs font-medium mb-1 text-gray-500">
            {message.anonymous_name || "Visitante"}
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
        <div className={cn(
          "text-[10px] mt-1",
          isOwnMessage ? "text-blue-100" : "text-gray-500"
        )}>
          {time}
          {isOwnMessage && message.is_read && (
            <span className="ml-1">✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
