
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
  const filePath = `${user.id}/profile.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('property_images')
    .upload(filePath, file, { upsert: true });

  if (error) {
    return { url: null, error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('property_images')
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}
