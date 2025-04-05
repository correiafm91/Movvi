
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Home, Bed, Bath, Maximize, HomeIcon, Phone, MapPin, ChevronLeft } from "lucide-react";
import { getPropertyById, Property } from "@/services/properties";
import { getRealtorInfo } from "@/services/auth";
import { formatCurrency } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<{
    name?: string;
    photo_url?: string;
    creci_code?: string | null;
    is_realtor?: boolean;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const propertyData = await getPropertyById(id);
        
        if (!propertyData) {
          toast({
            title: "Erro",
            description: "Imóvel não encontrado",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setProperty(propertyData);

        // Fetch owner information
        if (propertyData.owner_id) {
          const { profile } = await getRealtorInfo(propertyData.owner_id);
          if (profile) {
            setOwner(profile);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar imóvel:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as informações do imóvel",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, toast, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-28 px-4 flex items-center justify-center">
          <p>Carregando detalhes do imóvel...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-28 px-4 flex items-center justify-center">
          <p>Imóvel não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      <div className="container mx-auto py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/")}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              <HomeIcon size={16} className="mr-1" /> Início
            </Button>
            <div className="text-gray-500 text-sm ml-auto">
              {property.property_type} | {property.is_for_rent ? 'Aluguel' : 'Venda'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images and Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-0 shadow-sm">
                <div className="relative">
                  {property.images && property.images.length > 0 ? (
                    <Carousel className="relative">
                      <CarouselContent>
                        {property.images.map((image, index) => (
                          <CarouselItem key={index} className="pl-0">
                            <div className="aspect-[16/9] w-full">
                              <img
                                src={image.image_url}
                                alt={`${property.title} - Imagem ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-2 bg-blue-600 text-white border-none hover:bg-blue-700" />
                      <CarouselNext className="absolute right-2 bg-blue-600 text-white border-none hover:bg-blue-700" />
                    </Carousel>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Sem imagens disponíveis</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{property.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin size={16} className="text-gray-500" />
                    {property.address ? `${property.address}, ` : ""}{property.city}, {property.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Detalhes</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {property.bedrooms !== undefined && (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <Bed className="h-6 w-6 mb-2 text-blue-600" />
                            <span className="text-lg font-medium">{property.bedrooms}</span>
                            <span className="text-sm text-gray-500">
                              {property.bedrooms === 1 ? "Quarto" : "Quartos"}
                            </span>
                          </div>
                        )}
                        {property.bathrooms !== undefined && (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <Bath className="h-6 w-6 mb-2 text-blue-600" />
                            <span className="text-lg font-medium">{property.bathrooms}</span>
                            <span className="text-sm text-gray-500">
                              {property.bathrooms === 1 ? "Banheiro" : "Banheiros"}
                            </span>
                          </div>
                        )}
                        {property.area !== undefined && (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                            <Maximize className="h-6 w-6 mb-2 text-blue-600" />
                            <span className="text-lg font-medium">{property.area}</span>
                            <span className="text-sm text-gray-500">m²</span>
                          </div>
                        )}
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                          <Home className="h-6 w-6 mb-2 text-blue-600" />
                          <span className="text-sm text-gray-500">Tipo</span>
                          <span className="text-sm font-medium">{property.property_type}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {property.description || "Nenhuma descrição fornecida."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl text-blue-600">
                    {formatCurrency(property.price)}
                    {property.is_for_rent && <span className="text-lg ml-1">/mês</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {property.contact_phone && (
                    <div className="mb-4">
                      <Button className="w-full flex items-center gap-2">
                        <Phone size={18} /> Entrar em contato
                      </Button>
                    </div>
                  )}
                  <div>
                    <Badge className="bg-blue-600 text-black text-xs rounded-full mb-2">
                      {property.is_for_rent ? 'ALUGUEL' : 'VENDA'}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      Anunciado em {new Date(property.created_at || "").toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Card */}
              {owner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Anunciante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-gray-200">
                        <AvatarImage src={owner.photo_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {owner.name ? owner.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{owner.name || "Usuário"}</p>
                        {owner.is_realtor && owner.creci_code && (
                          <p className="text-sm text-gray-500">CRECI: {owner.creci_code}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  {property.contact_phone && (
                    <CardFooter className="border-t pt-4">
                      <p className="text-sm flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        {property.contact_phone}
                      </p>
                    </CardFooter>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
