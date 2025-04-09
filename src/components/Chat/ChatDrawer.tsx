
import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChatRoomWithDetails, getChatRooms } from "@/services/chat";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger, 
  DrawerClose 
} from "@/components/ui/drawer";

export default function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeChat, setActiveChat] = useState<ChatRoomWithDetails | null>(null);
  const isMobile = useIsMobile();

  // Get total unread count
  useEffect(() => {
    const getUnreadCount = async () => {
      try {
        const { rooms } = await getChatRooms();
        const count = rooms.reduce((acc, room) => acc + (room.unread_count || 0), 0);
        setUnreadCount(count);
      } catch (error) {
        console.error("Error getting unread count:", error);
      }
    };

    getUnreadCount();
    
    // Subscribe to new messages to update unread count
    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => {
          getUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectChat = (chatRoom: ChatRoomWithDetails) => {
    setActiveChat(chatRoom);
    // Adjust unread count when selecting a chat
    setUnreadCount(prev => Math.max(0, prev - (chatRoom.unread_count || 0)));
  };

  const handleBack = () => {
    setActiveChat(null);
  };

  // Using Sheet for desktop and Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 border-none"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 border-white border-2">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        
        <DrawerContent className="h-[95vh] max-h-[95vh]">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">
                {activeChat ? "Conversa" : "Bate-papo"}
              </h2>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {activeChat ? (
                <ChatInterface 
                  chatRoom={activeChat} 
                  onBack={handleBack} 
                  useFullHeight={true}
                />
              ) : (
                <ChatList onSelectChat={handleSelectChat} />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop version with Sheet
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 border-none"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 border-white border-2">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="sm:max-w-md w-[90vw]">
        <div className="h-full flex flex-col max-h-screen">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {activeChat ? "Conversa" : "Bate-papo"}
            </h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeChat ? (
              <ChatInterface 
                chatRoom={activeChat} 
                onBack={handleBack} 
              />
            ) : (
              <ChatList onSelectChat={handleSelectChat} />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
