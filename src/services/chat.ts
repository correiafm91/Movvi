
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Profile } from "./auth";

export interface ChatRoom {
  id: string;
  created_at: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string | null;
  is_anonymous: boolean | null;
  anonymous_name: string | null;
  message: string;
  created_at: string;
  is_read: boolean | null;
  property_id: string | null;
}

export interface ChatParticipant {
  id: string;
  chat_room_id: string;
  user_id: string | null;
  is_anonymous: boolean | null;
  anonymous_name: string | null;
  property_id: string | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface ChatRoomWithDetails {
  id: string;
  created_at: string;
  last_message_at: string;
  last_message?: ChatMessage;
  participants: (ChatParticipant & { profile?: Profile })[];
  property_id?: string | null;
  unread_count: number;
}

export const getChatRooms = async (): Promise<{ rooms: ChatRoomWithDetails[], error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    let query;
    if (user) {
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_room_id')
        .eq('user_id', user.id);

      if (participantError) {
        console.error("Error fetching chat participants:", participantError);
        return { rooms: [], error: participantError };
      }

      if (!participantData || participantData.length === 0) {
        return { rooms: [], error: null };
      }

      const roomIds = participantData.map(p => p.chat_room_id);

      const { data: roomsData, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .in('id', roomIds)
        .order('last_message_at', { ascending: false });

      if (roomsError) {
        console.error("Error fetching chat rooms:", roomsError);
        return { rooms: [], error: roomsError };
      }

      const enhancedRooms: ChatRoomWithDetails[] = await Promise.all(roomsData.map(async (room) => {
        const { data: lastMessageData } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_room_id', room.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        const { data: participants } = await supabase
          .from('chat_participants')
          .select('*');

        const roomParticipants = participants?.filter(p => p.chat_room_id === room.id) || [];

        const enhancedParticipants = await Promise.all(roomParticipants.map(async (p) => {
          if (p.user_id && p.user_id !== user.id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', p.user_id)
              .single();
              
            return { ...p, profile: profileData || undefined };
          }
          return p;
        }));

        const propertyParticipant = roomParticipants.find(p => p.property_id);
        const property_id = propertyParticipant?.property_id;

        return {
          ...room,
          last_message: lastMessageData || undefined,
          participants: enhancedParticipants,
          unread_count: unreadCount || 0,
          property_id
        };
      }));

      return { rooms: enhancedRooms, error: null };
    } else {
      // For anonymous users, try to get rooms from localStorage
      const anonymousRooms = [];
      
      // If there's a saved chat ID in localStorage, try to fetch it
      const savedChatId = localStorage.getItem('activeChat');
      if (savedChatId) {
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', savedChatId)
          .single();
        
        if (room) {
          const { data: lastMessageData } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('*')
            .eq('chat_room_id', room.id);
            
          const enhancedParticipants = await Promise.all((participants || []).map(async (p) => {
            if (p.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', p.user_id)
                .single();
                
              return { ...p, profile: profileData || undefined };
            }
            return p;
          }));
          
          const propertyParticipant = participants?.find(p => p.property_id);
          const property_id = propertyParticipant?.property_id;
          
          anonymousRooms.push({
            ...room,
            last_message: lastMessageData || undefined,
            participants: enhancedParticipants || [],
            unread_count: 0,
            property_id
          });
        }
      }
      
      return { rooms: anonymousRooms, error: null };
    }
  } catch (error) {
    console.error("Error in getChatRooms:", error);
    return { rooms: [], error: error as Error };
  }
};

export const getChatMessages = async (roomId: string): Promise<{ messages: ChatMessage[], error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching chat messages:", error);
      return { messages: [], error };
    }

    return { messages: data as ChatMessage[], error: null };
  } catch (error) {
    console.error("Error in getChatMessages:", error);
    return { messages: [], error: error as Error };
  }
};

export const sendMessage = async (roomId: string, message: string, propertyId?: string | null): Promise<{ success: boolean, error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let anonymousName = null;
    if (!user) {
      const { data: participant } = await supabase
        .from('chat_participants')
        .select('anonymous_name')
        .eq('chat_room_id', roomId)
        .is('user_id', null)
        .single();
      
      anonymousName = participant?.anonymous_name || null;
    }
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_room_id: roomId,
        sender_id: user?.id || null,
        is_anonymous: !user,
        anonymous_name: anonymousName,
        message,
        property_id: propertyId || null
      });

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error };
    }

    await supabase
      .from('chat_rooms')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', roomId);

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: error as Error };
  }
};

export const markMessagesAsRead = async (roomId: string): Promise<{ success: boolean, error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_room_id', roomId)
      .is('is_read', false);

    if (error) {
      console.error("Error marking messages as read:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return { success: false, error: error as Error };
  }
};

export const startChatWithPropertyOwner = async (
  propertyId: string, 
  initialMessage: string,
  visitorName?: string
): Promise<{ roomId: string | null, error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      console.error("Error fetching property:", propertyError);
      return { roomId: null, error: propertyError };
    }

    const ownerId = property.owner_id;
    
    let existingChat = null;
    if (user) {
      const { data } = await supabase
        .from('chat_participants')
        .select('chat_room_id')
        .eq('property_id', propertyId)
        .eq('user_id', user.id);
      
      existingChat = data && data.length > 0 ? data[0] : null;
    } else if (visitorName) {
      const { data } = await supabase
        .from('chat_participants')
        .select('chat_room_id')
        .eq('property_id', propertyId)
        .eq('anonymous_name', visitorName)
        .is('user_id', null);
      
      existingChat = data && data.length > 0 ? data[0] : null;
    }
    
    let roomId = existingChat ? existingChat.chat_room_id : null;

    if (!roomId) {
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({})
        .select('id')
        .single();

      if (roomError) {
        console.error("Error creating chat room:", roomError);
        return { roomId: null, error: roomError };
      }

      roomId = room.id;

      const ownerParticipantData = {
        chat_room_id: roomId,
        user_id: ownerId,
        property_id: propertyId
      };
      
      const { error: ownerParticipantError } = await supabase
        .from('chat_participants')
        .insert(ownerParticipantData);
        
      if (ownerParticipantError) {
        console.error("Error adding owner participant:", ownerParticipantError);
        return { roomId: null, error: ownerParticipantError };
      }

      const visitorParticipantData = {
        chat_room_id: roomId,
        user_id: user?.id || null,
        is_anonymous: !user,
        anonymous_name: !user ? visitorName || "Visitante" : null,
        property_id: propertyId
      };
      
      const { error: visitorParticipantError } = await supabase
        .from('chat_participants')
        .insert(visitorParticipantData);
        
      if (visitorParticipantError) {
        console.error("Error adding visitor participant:", visitorParticipantError);
        return { roomId: null, error: visitorParticipantError };
      }
    }

    if (initialMessage) {
      const { success, error: messageError } = await sendMessage(roomId, initialMessage, propertyId);
      if (!success) {
        console.error("Error sending initial message:", messageError);
        return { roomId, error: messageError };
      }
    }

    return { roomId, error: null };
  } catch (error) {
    console.error("Error in startChatWithPropertyOwner:", error);
    return { roomId: null, error: error as Error };
  }
};

export const isUserOnline = (lastActiveAt: string | null): boolean => {
  if (!lastActiveAt) return false;
  
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  return lastActive > fiveMinutesAgo;
};

export const updateUserLastActive = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);
  } catch (error) {
    console.error("Error updating user's last active timestamp:", error);
  }
};

export const subscribeToNewMessages = (
  roomId: string, 
  callback: (message: ChatMessage) => void
) => {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${roomId}`
      },
      (payload) => {
        callback(payload.new as ChatMessage);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${roomId}`
      },
      (payload) => {
        // Force refresh messages when a message is updated or deleted
        getChatMessages(roomId).then(({ messages }) => {
          // This will trigger a component re-render with updated messages
          callback(payload.new as ChatMessage);
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${roomId}`
      },
      () => {
        // Force refresh messages when a message is deleted
        getChatMessages(roomId).then(({ messages }) => {
          // We can't pass the deleted message (it's not in payload.old)
          // so we trigger a refresh by sending a dummy message that will be filtered out
          callback({
            id: 'refresh-trigger',
            chat_room_id: roomId,
            sender_id: null,
            is_anonymous: null,
            anonymous_name: null,
            message: '',
            created_at: new Date().toISOString(),
            is_read: null,
            property_id: null
          });
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToUserPresence = (
  userId: string, 
  callback: (isOnline: boolean) => void
) => {
  const channel = supabase
    .channel(`presence-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        if (payload.new && 'last_active_at' in payload.new) {
          callback(isUserOnline(payload.new.last_active_at as string));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// New functions for message operations

export const deleteMessage = async (messageId: string): Promise<{ success: boolean, error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error("Error deleting message:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    return { success: false, error: error as Error };
  }
};

export const editMessage = async (messageId: string, newText: string): Promise<{ success: boolean, error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ message: newText })
      .eq('id', messageId);

    if (error) {
      console.error("Error editing message:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in editMessage:", error);
    return { success: false, error: error as Error };
  }
};

export const deleteConversation = async (roomId: string): Promise<{ success: boolean, error: Error | null }> => {
  try {
    // First delete all messages in the room
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('chat_room_id', roomId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return { success: false, error: messagesError };
    }

    // Then delete all participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .delete()
      .eq('chat_room_id', roomId);

    if (participantsError) {
      console.error("Error deleting participants:", participantsError);
      return { success: false, error: participantsError };
    }

    // Finally delete the room itself
    const { error: roomError } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', roomId);

    if (roomError) {
      console.error("Error deleting room:", roomError);
      return { success: false, error: roomError };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return { success: false, error: error as Error };
  }
};
