
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRealtorInfo } from "@/services/auth";
import { getPropertiesByOwner } from "@/services/properties";
import PropertyCard from "@/components/PropertyCard";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Award } from "lucide-react";

const RealtorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [realtor, setRealtor] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealtorData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { profile } = await getRealtorInfo(id);
        if (profile) {
          setRealtor(profile);
        }

        const data = await getPropertiesByOwner(id);
        setProperties(data || []);
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
        <div className="container mx-auto py-28 px-4 flex items-center justify-center">
          <p>Carregando informações do corretor...</p>
        </div>
      </div>
    );
  }

  if (!realtor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-28 px-4 flex items-center justify-center">
          <p>Corretor não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      <div className="container mx-auto py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-gray-200">
                  <AvatarImage src={realtor.photo_url} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {realtor.name ? realtor.name.charAt(0).toUpperCase() : "R"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-2xl">{realtor.name}</CardTitle>
                    {realtor.is_sponsored && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Award className="h-3 w-3 mr-1" /> Patrocinado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span>Corretor de Imóveis</span>
                    {realtor.creci_code && (
                      <>
                        <span className="mx-1">•</span>
                        <span>CRECI: {realtor.creci_code}</span>
                      </>
                    )}
                  </div>
                  {realtor.phone && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{realtor.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Imóveis deste corretor</h2>

          {properties.length === 0 ? (
            <p className="text-gray-500">Este corretor não possui imóveis anunciados no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtorProfile;
