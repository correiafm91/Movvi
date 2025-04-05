import { supabase } from "@/integrations/supabase/client";

export interface Property {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city: string;
  state: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  property_type: string;
  is_for_rent: boolean;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  contact_phone?: string;
  images?: {
    id: string;
    image_url: string;
    property_id: string;
  }[];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      images (
        id,
        image_url,
        property_id
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Erro ao buscar imóvel:", error);
    return null;
  }

  return data as Property;
}

export async function getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        images (
          id,
          image_url,
          property_id
        )
      `)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error("Error fetching properties:", error);
      return [];
    }
  
    return data as Property[];
  }

export async function createProperty(property: Omit<Property, 'id'>): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();
  
    if (error) {
      console.error("Error creating property:", error);
      return null;
    }
  
    return data as Property;
  }

  export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  
    if (error) {
      console.error("Error updating property:", error);
      return null;
    }
  
    return data as Property;
  }
  
  export async function deleteProperty(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
  
    if (error) {
      console.error("Error deleting property:", error);
      return false;
    }
  
    return true;
  }

export async function getPropertiesByOwner(ownerId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      images (
        id,
        image_url,
        property_id
      )
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching properties by owner:", error);
    return [];
  }

  return data as Property[];
}
