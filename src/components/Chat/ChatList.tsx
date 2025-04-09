
import { useEffect, useState } from "react";
import { getChatRooms, ChatRoomWithDetails } from "@/services/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import { Link } from "react-router-dom";
import UserStatus from "./UserStatus";
import { MessageCircle, Home } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";

interface ChatListProps {
  onSelectChat: (chatRoom: ChatRoomWithDetails) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        const { rooms } = await getChatRooms();
        setChatRooms(rooms);
      } catch (error) {
        console.error("Error loading chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChatRooms();
    
    // Set up subscription for new messages to update the chat list
    const chatChannel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async () => {
          // Refresh chat rooms when a new message is received
          const { rooms } = await getChatRooms();
          setChatRooms(rooms);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);
  
  if (loading) {
    return <div className="p-4 text-center">Carregando conversas...</div>;
  }
  
  if (chatRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-10 h-10 text-blue-600 mb-2" />
        <h3 className="text-lg font-medium mb-2">Nenhuma conversa ainda</h3>
        <p className="text-sm text-gray-500 mb-4">
          Inicie um chat nos detalhes de um imóvel para começar a conversar com corretores.
        </p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Explorar imóveis
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {chatRooms.map((room) => {
          // Find the other participant in this conversation
          const otherParticipant = user 
            ? room.participants.find(p => p.user_id !== user.id && p.user_id !== null)
            : room.participants.find(p => p.user_id !== null);
            
          const otherProfile = otherParticipant?.profile;
          const lastMessage = room.last_message;
          const hasUnread = room.unread_count > 0;
          
          // Anonymous participants
          const anonymousParticipant = room.participants.find(p => p.is_anonymous);
          
          return (
            <div 
              key={room.id}
              onClick={() => onSelectChat(room)}
              className={`cursor-pointer rounded-lg p-3 transition-colors ${
                hasUnread ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex gap-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  {otherProfile?.photo_url ? (
                    <AvatarImage src={otherProfile.photo_url} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {otherProfile?.name 
                        ? otherProfile.name.charAt(0).toUpperCase() 
                        : anonymousParticipant?.anonymous_name 
                          ? anonymousParticipant.anonymous_name.charAt(0).toUpperCase()
                          : "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium truncate">
                      {otherProfile?.name || anonymousParticipant?.anonymous_name || "Usuário"}
                    </div>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(new Date(lastMessage.created_at))}
                      </span>
                    )}
                  </div>
                  
                  {otherParticipant?.user_id && (
                    <UserStatus 
                      userId={otherParticipant.user_id} 
                      lastSeen={otherProfile?.last_active_at}
                    />
                  )}
                  
                  <div className="flex items-center justify-between mt-1">
                    {lastMessage && (
                      <p className={`text-sm truncate ${hasUnread ? 'font-medium' : 'text-gray-600'}`}>
                        {lastMessage.sender_id === user?.id ? "Você: " : ""}
                        {lastMessage.message}
                      </p>
                    )}
                    {hasUnread && (
                      <Badge className="bg-blue-600 ml-2">{room.unread_count}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
