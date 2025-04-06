
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Property, getPropertiesByOwner } from "@/services/properties";
import PropertyCard from "@/components/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface RealtorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  creci_code?: string;
}

const RealtorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [realtor, setRealtor] = useState<RealtorProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rentProperties, setRentProperties] = useState<Property[]>([]);
  const [saleProperties, setSaleProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealtorData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch realtor profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) {
          console.error("Error fetching realtor profile:", profileError);
          return;
        }

        setRealtor(profileData);

        // Fetch realtor properties
        const realtorProperties = await getPropertiesByOwner(id);
        setProperties(realtorProperties);

        // Split properties by type
        setRentProperties(realtorProperties.filter(p => p.is_for_rent));
        setSaleProperties(realtorProperties.filter(p => !p.is_for_rent));

      } catch (error) {
        console.error("Error fetching realtor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealtorData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-10 pt-28">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!realtor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-10 pt-28">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Corretor não encontrado</h2>
            <p className="text-gray-600">O perfil que você está procurando não existe.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-10 pt-28">
        {/* Realtor Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                {realtor.photo_url ? (
                  <img
                    src={realtor.photo_url}
                    alt={realtor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem foto
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-3/4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{realtor.name}</h1>
                <Badge className="bg-blue-600 text-white">Corretor</Badge>
              </div>
              {realtor.creci_code && (
                <p className="text-gray-600 mb-2">CRECI: {realtor.creci_code}</p>
              )}
              {realtor.phone && (
                <p className="text-gray-600 mb-4">Telefone: {realtor.phone}</p>
              )}
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {properties.length} imóveis
                </span>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {saleProperties.length} à venda
                </span>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {rentProperties.length} para aluguel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Realtor Properties */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Imóveis deste corretor</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todos ({properties.length})</TabsTrigger>
              <TabsTrigger value="sale">À Venda ({saleProperties.length})</TabsTrigger>
              <TabsTrigger value="rent">Para Alugar ({rentProperties.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <PropertyGrid properties={properties} />
            </TabsContent>
            <TabsContent value="sale">
              <PropertyGrid properties={saleProperties} />
            </TabsContent>
            <TabsContent value="rent">
              <PropertyGrid properties={rentProperties} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const PropertyGrid = ({ properties }: { properties: Property[] }) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Nenhum imóvel encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => {
        const mainImage = property.images?.find(img => img.is_main)?.image_url || 
                         property.images?.[0]?.image_url || 
                         '/placeholder.svg';
        
        return (
          <div key={property.id} className="animate-fade-in">
            <PropertyCard
              id={property.id}
              title={property.title}
              price={property.price}
              location={`${property.city}, ${property.state}`}
              beds={property.bedrooms}
              baths={property.bathrooms}
              squareMeters={property.area}
              imageUrl={mainImage}
              isForRent={property.is_for_rent}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RealtorProfile;
