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
    is_main?: boolean;
  }[];
}

export interface PropertySearchParams {
  type?: 'all' | 'rent' | 'sale';
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        property_id,
        is_main
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Erro ao buscar imóvel:", error);
    return null;
  }

  const property = {
    ...data,
    images: data.property_images || []
  } as Property;

  return property;
}

export async function getProperties(params: PropertySearchParams = {}): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        property_id,
        is_main
      )
    `);

  if (params.type && params.type !== 'all') {
    const isForRent = params.type === 'rent';
    query = query.eq('is_for_rent', isForRent);
  }

  if (params.state) {
    query = query.eq('state', params.state);
  }

  if (params.city) {
    query = query.eq('city', params.city);
  }

  if (params.minPrice !== undefined && params.minPrice !== null) {
    query = query.gte('price', params.minPrice);
  }

  if (params.maxPrice !== undefined && params.maxPrice !== null) {
    query = query.lte('price', params.maxPrice);
  }
  
  if (params.propertyType) {
    query = query.eq('property_type', params.propertyType);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching properties:", error);
    return [];
  }

  const properties = data.map(item => ({
    ...item,
    images: item.property_images || []
  })) as Property[];

  return properties;
}

export async function createProperty(propertyData: Omit<Property, 'id'>, photos?: File[]): Promise<{success: boolean, data?: Property, error?: any}> {
  try {
    if (!propertyData.owner_id) {
      console.error("Error: owner_id is required");
      return { success: false, error: "owner_id is required" };
    }

    const { data: propertyResult, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: propertyData.title,
        description: propertyData.description,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        property_type: propertyData.property_type,
        is_for_rent: propertyData.is_for_rent,
        owner_id: propertyData.owner_id,
        contact_phone: propertyData.contact_phone,
      })
      .select()
      .single();
  
    if (propertyError) {
      console.error("Error creating property:", propertyError);
      return { success: false, error: propertyError };
    }
  
    if (photos && photos.length > 0) {
      const imagePromises = photos.map(async (photo, index) => {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${propertyResult.id}-${Date.now()}-${index}.${fileExt}`;
        const filePath = `property-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, photo);
  
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          return null;
        }

        const { data: publicUrlData } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        const { error: imageError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyResult.id,
            image_url: publicUrlData.publicUrl,
            is_main: index === 0
          });

        if (imageError) {
          console.error("Error inserting image record:", imageError);
          return null;
        }

        return {
          id: '',
          property_id: propertyResult.id,
          image_url: publicUrlData.publicUrl,
          is_main: index === 0
        };
      });

      const imageResults = await Promise.all(imagePromises);
      const validImageResults = imageResults.filter(Boolean);

      return { 
        success: true, 
        data: { 
          ...propertyResult, 
          images: validImageResults 
        } as Property 
      };
    }

    return { 
      success: true, 
      data: propertyResult as Property 
    };
  } catch (error) {
    console.error("Unexpected error creating property:", error);
    return { success: false, error };
  }
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<{success: boolean, data?: Property, error?: any}> {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating property:", error);
    return { success: false, error };
  }

  return { success: true, data: data as Property };
}

export async function deleteProperty(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

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
      property_images (
        id,
        image_url,
        property_id,
        is_main
      )
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching properties by owner:", error);
    return [];
  }

  const properties = data.map(item => ({
    ...item,
    images: item.property_images || []
  })) as Property[];

  return properties;
}
