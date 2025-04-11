
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  getChatMessages, 
  sendMessage, 
  markMessagesAsRead, 
  ChatMessage as ChatMessageType,
  ChatRoomWithDetails,
  subscribeToNewMessages,
  updateUserLastActive,
  deleteConversation
} from "@/services/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Property, getPropertyById } from "@/services/properties";
import { Send, ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import UserStatus from "./UserStatus";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInterfaceProps {
  chatRoom: ChatRoomWithDetails;
  onBack: () => void;
  useFullHeight?: boolean;
}

export default function ChatInterface({ chatRoom, onBack, useFullHeight = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const { user } = useUser();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [anonymousParticipant, setAnonymousParticipant] = useState<any>(null);
  
  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const { messages: chatMessages } = await getChatMessages(chatRoom.id);
        setMessages(chatMessages);
        
        // Mark messages as read
        await markMessagesAsRead(chatRoom.id);
        
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up real-time subscription for new messages
    const unsubscribe = subscribeToNewMessages(chatRoom.id, (newMessage) => {
      setMessages((prevMessages) => {
        // Check if the message is already in the array to avoid duplicates
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        return [...prevMessages, newMessage];
      });
      // Mark as read if the message is not from the current user
      if (newMessage.sender_id !== user?.id) {
        markMessagesAsRead(chatRoom.id);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [chatRoom.id, user?.id]);
  
  // Update user's active status periodically
  useEffect(() => {
    if (user) {
      updateUserLastActive();
      const interval = setInterval(updateUserLastActive, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [user]);
  
  // Find participants
  useEffect(() => {
    if (chatRoom.participants) {
      // Find other participant (non-anonymous)
      if (user) {
        const other = chatRoom.participants.find(p => 
          p.user_id !== user.id && p.user_id !== null
        );
        if (other) {
          setOtherParticipant({
            id: other.user_id,
            name: other.profile?.name || "Usuário",
            photo: other.profile?.photo_url,
            lastSeen: other.profile?.last_active_at
          });
        }
      } else {
        // For anonymous users, find the property owner
        const other = chatRoom.participants.find(p => 
          !p.is_anonymous
        );
        if (other) {
          setOtherParticipant({
            id: other.user_id,
            name: other.profile?.name || "Usuário",
            photo: other.profile?.photo_url,
            lastSeen: other.profile?.last_active_at
          });
        }
      }
      
      // Find anonymous participant
      const anonymous = chatRoom.participants.find(p => p.is_anonymous);
      if (anonymous) {
        setAnonymousParticipant({
          name: anonymous.anonymous_name || "Visitante"
        });
      }
    }
  }, [chatRoom.participants, user]);
  
  // Load property details if available
  useEffect(() => {
    const loadProperty = async () => {
      if (chatRoom.property_id) {
        try {
          const propertyData = await getPropertyById(chatRoom.property_id);
          setProperty(propertyData);
        } catch (error) {
          console.error("Error loading property:", error);
        }
      }
    };
    
    loadProperty();
  }, [chatRoom.property_id]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const { success, error } = await sendMessage(chatRoom.id, newMessage);
      if (success) {
        setNewMessage("");
        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: error?.message || "Ocorreu um erro ao enviar sua mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = async () => {
    try {
      const { success, error } = await deleteConversation(chatRoom.id);
      if (success) {
        toast({
          title: "Conversa excluída",
          description: "A conversa foi excluída com sucesso.",
        });
        // Remove from localStorage if it was the active chat
        if (localStorage.getItem('activeChat') === chatRoom.id) {
          localStorage.removeItem('activeChat');
        }
        onBack();
      } else {
        toast({
          title: "Erro ao excluir conversa",
          description: error?.message || "Ocorreu um erro ao excluir a conversa.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Erro ao excluir conversa",
        description: "Ocorreu um erro ao excluir a conversa.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={`flex flex-col bg-white ${useFullHeight ? 'h-full' : ''}`}>
      {/* Chat header */}
      <div className="flex items-center p-4 border-b bg-blue-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center flex-1">
          {otherParticipant ? (
            <>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={otherParticipant.photo} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{otherParticipant.name}</div>
                {otherParticipant.id && (
                  <UserStatus userId={otherParticipant.id} lastSeen={otherParticipant.lastSeen} />
                )}
              </div>
            </>
          ) : (
            <div className="font-medium">Chat</div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir conversa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Property card if applicable */}
      {property && (
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0].image_url} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem foto
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link to={`/property/${property.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                {property.title}
              </Link>
              <p className="text-xs text-gray-500">{property.city}, {property.state}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages area */}
      <ScrollArea className={`flex-1 p-4 ${useFullHeight ? 'h-full' : ''}`}>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Carregando mensagens...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma mensagem ainda. Comece a conversar!
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isOwnMessage={
                  user 
                    ? user.id === message.sender_id
                    : message.is_anonymous && (!message.sender_id || message.sender_id === null)
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Message input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="resize-none min-h-[60px]"
            ref={messageInputRef}
            disabled={sending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
