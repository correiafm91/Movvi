
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  state: string;
  city: string;
  address?: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  is_for_rent: boolean;
  owner_id: string;
  contact_phone?: string;
  created_at?: string;
  updated_at?: string;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id?: string;
  property_id?: string;
  image_url: string;
  is_main?: boolean;
}

export interface NewProperty {
  title: string;
  description?: string;
  price: number;
  state: string;
  city: string;
  address?: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  is_for_rent: boolean;
  contact_phone?: string;
}

export interface PropertySearchParams {
  type?: 'all' | 'rent' | 'sale';
  state?: string;
  city?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getProperties(params: PropertySearchParams = {}) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images(*)
    `);
  
  // Filter by rent/sale type
  if (params.type === 'rent') {
    query = query.eq('is_for_rent', true);
  } else if (params.type === 'sale') {
    query = query.eq('is_for_rent', false);
  }

  // Filter by location
  if (params.state) {
    query = query.eq('state', params.state);
  }
  
  if (params.city) {
    query = query.eq('city', params.city);
  }

  // Filter by price range
  if (params.minPrice !== undefined) {
    query = query.gte('price', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice);
  }
  
  // Search by query text (we need to implement this on the client side)
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    toast({
      title: "Erro ao buscar imóveis",
      description: error.message,
      variant: "destructive",
    });
    return [];
  }

  // Formatar os dados para o formato esperado pelo frontend
  const formattedProperties = data.map((property: any) => {
    const images = property.property_images || [];
    
    return {
      ...property,
      images,
      mainImage: images.find((img: PropertyImage) => img.is_main)?.image_url || 
                (images.length > 0 ? images[0].image_url : '/placeholder.svg')
    };
  });
  
  // Filter by search query if provided (client-side)
  if (params.query) {
    const searchQuery = params.query.toLowerCase();
    return formattedProperties.filter((property: Property) => 
      property.title.toLowerCase().includes(searchQuery) || 
      (property.description && property.description.toLowerCase().includes(searchQuery)) ||
      property.property_type.toLowerCase().includes(searchQuery) ||
      property.city.toLowerCase().includes(searchQuery) ||
      property.state.toLowerCase().includes(searchQuery)
    );
  }

  return formattedProperties;
}

export async function getPropertiesByOwner() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast({
      title: "Erro de autenticação",
      description: "Você precisa estar logado para ver seus imóveis.",
      variant: "destructive",
    });
    return [];
  }

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(*)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    toast({
      title: "Erro ao buscar imóveis",
      description: error.message,
      variant: "destructive",
    });
    return [];
  }

  // Formatar os dados
  const formattedProperties = data.map((property: any) => {
    const images = property.property_images || [];
    
    return {
      ...property,
      images,
      mainImage: images.find((img: PropertyImage) => img.is_main)?.image_url || 
                (images.length > 0 ? images[0].image_url : '/placeholder.svg')
    };
  });

  return formattedProperties;
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    toast({
      title: "Erro ao buscar imóvel",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }

  // Formatar os dados
  const property = {
    ...data,
    images: data.property_images || [],
    mainImage: data.property_images?.find((img: PropertyImage) => img.is_main)?.image_url || 
              (data.property_images?.length > 0 ? data.property_images[0].image_url : '/placeholder.svg')
  };

  return property;
}

export async function createProperty(propertyData: NewProperty, images: File[]) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast({
      title: "Erro",
      description: "Você precisa estar logado para criar um anúncio",
      variant: "destructive",
    });
    return { success: false, error: new Error("Usuário não autenticado") };
  }

  // Criar o imóvel
  const { data, error } = await supabase
    .from('properties')
    .insert({ ...propertyData, owner_id: user.id })
    .select()
    .single();

  if (error) {
    toast({
      title: "Erro ao criar anúncio",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  const propertyId = data.id;

  // Fazer upload das imagens
  const uploadedImages: PropertyImage[] = [];
  let isFirst = true;

  for (const file of images) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${propertyId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Erro ao fazer upload da imagem:", uploadError);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property_images')
      .getPublicUrl(uploadData.path);

    // Adicionar imagem ao banco de dados
    const { data: imageData, error: imageError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        image_url: publicUrl,
        is_main: isFirst
      })
      .select()
      .single();

    if (!imageError) {
      uploadedImages.push(imageData);
    }

    isFirst = false;
  }

  return { 
    success: true, 
    data: { 
      ...data, 
      images: uploadedImages 
    } 
  };
}

export async function updateProperty(id: string, propertyData: Partial<NewProperty>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast({
      title: "Erro",
      description: "Você precisa estar logado para editar um anúncio",
      variant: "destructive",
    });
    return { success: false, error: new Error("Usuário não autenticado") };
  }

  // Verificar se o imóvel pertence ao usuário
  const { data: propertyCheck, error: checkError } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (checkError || !propertyCheck) {
    toast({
      title: "Erro",
      description: "Imóvel não encontrado",
      variant: "destructive",
    });
    return { success: false, error: checkError || new Error("Imóvel não encontrado") };
  }

  if (propertyCheck.owner_id !== user.id) {
    toast({
      title: "Erro",
      description: "Você não tem permissão para editar este imóvel",
      variant: "destructive",
    });
    return { success: false, error: new Error("Permissão negada") };
  }

  // Atualizar o imóvel
  const { data, error } = await supabase
    .from('properties')
    .update({ ...propertyData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast({
      title: "Erro ao atualizar anúncio",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteProperty(propertyId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast({
      title: "Erro",
      description: "Você precisa estar logado para excluir um anúncio",
      variant: "destructive",
    });
    return { success: false, error: new Error("Usuário não autenticado") };
  }

  // Verificar se o imóvel pertence ao usuário
  const { data: propertyCheck, error: checkError } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', propertyId)
    .single();

  if (checkError || !propertyCheck) {
    toast({
      title: "Erro",
      description: "Imóvel não encontrado",
      variant: "destructive",
    });
    return { success: false, error: checkError || new Error("Imóvel não encontrado") };
  }

  if (propertyCheck.owner_id !== user.id) {
    toast({
      title: "Erro",
      description: "Você não tem permissão para excluir este imóvel",
      variant: "destructive",
    });
    return { success: false, error: new Error("Permissão negada") };
  }

  // Excluir o imóvel
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) {
    toast({
      title: "Erro ao excluir imóvel",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }

  return { success: true };
}
