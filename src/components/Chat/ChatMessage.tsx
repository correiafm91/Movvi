
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType, deleteMessage, editMessage } from "@/services/chat";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const [sender, setSender] = useState<{ name?: string; photo_url?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.message);
  const { toast } = useToast();
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

  const handleDelete = async () => {
    try {
      const { success, error } = await deleteMessage(message.id);
      if (success) {
        toast({
          title: "Mensagem excluída",
          description: "A mensagem foi excluída com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao excluir mensagem",
          description: error?.message || "Ocorreu um erro ao excluir a mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Erro ao excluir mensagem",
        description: "Ocorreu um erro ao excluir a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (editedMessage.trim() === "") return;
    
    try {
      const { success, error } = await editMessage(message.id, editedMessage);
      if (success) {
        setIsEditing(false);
        toast({
          title: "Mensagem editada",
          description: "A mensagem foi editada com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao editar mensagem",
          description: error?.message || "Ocorreu um erro ao editar a mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: "Erro ao editar mensagem",
        description: "Ocorreu um erro ao editar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedMessage(message.message);
  };
  
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
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full p-1 text-sm text-black border rounded"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
            />
            <div className="flex justify-end gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-white"
                onClick={cancelEdit}
              >
                <X className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-white"
                onClick={handleEdit}
              >
                <Check className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{message.message}</p>
        )}
        
        <div className="flex items-center justify-between mt-1">
          <span className={cn(
            "text-[10px]",
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          )}>
            {time}
            {isOwnMessage && message.is_read && (
              <span className="ml-1">✓</span>
            )}
          </span>
          
          {isOwnMessage && !isEditing && (
            <div className="flex gap-1">
              <button 
                onClick={() => setIsEditing(true)} 
                className={cn(
                  "p-1 rounded-full hover:bg-blue-700",
                  "focus:outline-none focus:ring-1 focus:ring-blue-300"
                )}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button 
                onClick={handleDelete} 
                className={cn(
                  "p-1 rounded-full hover:bg-blue-700",
                  "focus:outline-none focus:ring-1 focus:ring-blue-300"
                )}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
