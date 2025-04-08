import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type AuthSignUpCredentials = {
  email: string;
  password: string;
};

export type AuthSignInCredentials = {
  email: string;
  password: string;
};

export type Profile = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  photo_url?: string;
  is_realtor?: boolean;
  creci_code?: string | null;
  work_state?: string | null;
  work_city?: string | null;
  scheduling_link?: string | null;
  level_id?: number | null;
  property_count?: number | null;
  ad_count?: number | null;
  positive_ratings?: number | null;
  display_badge?: boolean | null;
  completed_missions?: string[] | null;
};

export async function signUp({ email, password }: AuthSignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    toast({
      title: "Erro ao criar conta",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  return { success: true, data };
}

export async function signIn({ email, password }: AuthSignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast({
      title: "Erro ao entrar",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  return { success: true, data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    toast({
      title: "Erro ao sair",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  return { success: true };
}

export async function getProfile(): Promise<{ profile: Profile | null, error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { profile: null, error: new Error("Usuário não encontrado") };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return { profile: null, error };
  }

  return { profile: data as Profile, error: null };
}

export async function updateProfile(profile: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: new Error("Usuário não autenticado") };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id);

  if (error) {
    toast({
      title: "Erro ao atualizar perfil",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  return { success: true, data };
}

export async function uploadProfilePhoto(file: File): Promise<{ url: string | null, error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { url: null, error: new Error("Usuário não autenticado") };
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `profiles/${user.id}.${fileExt}`;

  const { error } = await supabase.storage
    .from('properties')
    .upload(filePath, file, { upsert: true });

  if (error) {
    return { url: null, error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('properties')
    .getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

export async function getRealtorInfo(userId: string): Promise<{ profile: Profile | null, error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, photo_url, creci_code, is_realtor, work_state, work_city, scheduling_link')
    .eq('id', userId)
    .single();

  if (error) {
    return { profile: null, error };
  }

  return { profile: data as Profile, error: null };
}
