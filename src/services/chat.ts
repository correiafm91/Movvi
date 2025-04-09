
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

// Get all chat rooms for the current user
export const getChatRooms = async (): Promise<{ rooms: ChatRoomWithDetails[], error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { rooms: [], error: new Error("User not authenticated") };
    }

    // Get rooms where the user is a participant
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

    // Get the chat rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds)
      .order('last_message_at', { ascending: false });

    if (roomsError) {
      console.error("Error fetching chat rooms:", roomsError);
      return { rooms: [], error: roomsError };
    }

    // Enhance each room with its last message and participants
    const enhancedRooms: ChatRoomWithDetails[] = await Promise.all(roomsData.map(async (room) => {
      // Get the last message
      const { data: lastMessageData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_room_id', room.id)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      // Get participants
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('chat_room_id', room.id);

      // Get profiles for participants
      const enhancedParticipants = await Promise.all((participants || []).map(async (p) => {
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

      // Get the property associated with this chat
      const propertyParticipant = participants?.find(p => p.property_id);
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
  } catch (error) {
    console.error("Error in getChatRooms:", error);
    return { rooms: [], error: error as Error };
  }
};

// Get messages for a specific chat room
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

// Send a message in a chat room
export const sendMessage = async (roomId: string, message: string, propertyId?: string | null): Promise<{ success: boolean, error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && !propertyId) {
      return { success: false, error: new Error("User not authenticated and no property specified") };
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_room_id: roomId,
        sender_id: user?.id || null,
        is_anonymous: !user,
        anonymous_name: !user ? "Visitante" : null,
        message,
        property_id: propertyId || null
      });

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error };
    }

    // Update the last_message_at timestamp in the chat room
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

// Mark messages as read
export const markMessagesAsRead = async (roomId: string): Promise<{ success: boolean, error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: new Error("User not authenticated") };
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_room_id', roomId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

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

// Start a chat with a property owner
export const startChatWithPropertyOwner = async (
  propertyId: string, 
  initialMessage: string
): Promise<{ roomId: string | null, error: Error | null }> => {
  try {
    // Get the user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get property details to know the owner
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
    
    // Check if there's already a chat room between these users for this property
    const { data: existingChat } = await supabase
      .from('chat_participants')
      .select('chat_room_id')
      .eq('property_id', propertyId)
      .eq('user_id', user?.id || null);
      
    let roomId = existingChat && existingChat.length > 0 ? existingChat[0].chat_room_id : null;

    // If no existing chat, create a new one
    if (!roomId) {
      // Create a new chat room
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

      // Add the property owner as a participant
      await supabase
        .from('chat_participants')
        .insert({
          chat_room_id: roomId,
          user_id: ownerId,
          property_id: propertyId
        });

      // Add the current user or anonymous user as a participant
      await supabase
        .from('chat_participants')
        .insert({
          chat_room_id: roomId,
          user_id: user?.id || null,
          is_anonymous: !user,
          anonymous_name: !user ? "Visitante" : null,
          property_id: propertyId
        });
    }

    // Send the initial message
    if (initialMessage) {
      await sendMessage(roomId, initialMessage, propertyId);
    }

    return { roomId, error: null };
  } catch (error) {
    console.error("Error in startChatWithPropertyOwner:", error);
    return { roomId: null, error: error as Error };
  }
};

// Check if user is online based on last_active_at timestamp
export const isUserOnline = (lastActiveAt: string | null): boolean => {
  if (!lastActiveAt) return false;
  
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  
  // Consider user online if active in the last 5 minutes
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  return lastActive > fiveMinutesAgo;
};

// Update user's last active timestamp
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

// Setup a realtime subscription for new messages
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
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Setup realtime subscription for user presence updates
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
