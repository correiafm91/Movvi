
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getPropertyById, Property } from "@/services/properties";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPropertyById(id);
        
        if (data) {
          setProperty(data);
          if (data.images && data.images.length > 0) {
            const mainImage = data.images.find(img => img.is_main)?.image_url || data.images[0].image_url;
            setActiveImage(mainImage);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do imóvel:", error);
        toast({
          title: "Erro ao carregar imóvel",
          description: "Não foi possível carregar os detalhes deste imóvel.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-28 flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-28 container mx-auto px-4">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Imóvel não encontrado</h2>
            <p className="text-gray-600 mb-8">O imóvel que você está procurando não existe ou foi removido.</p>
            <Button asChild>
              <a href="/">Voltar para página inicial</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleContactClick = () => {
    if (property.contact_phone) {
      window.open(`https://wa.me/${property.contact_phone.replace(/\D/g, '')}`, '_blank');
    } else {
      toast({
        title: "Contato indisponível",
        description: "Este anúncio não possui telefone para contato.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-28 pb-16 container mx-auto px-4">
        <div className="md:flex md:space-x-8">
          {/* Imagens */}
          <div className="md:w-2/3">
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              {activeImage && (
                <img 
                  src={activeImage} 
                  alt={property.title} 
                  className="w-full h-[400px] object-cover" 
                />
              )}
            </div>
            
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((img) => (
                  <div 
                    key={img.id}
                    className={`cursor-pointer rounded-md overflow-hidden border-2 ${activeImage === img.image_url ? 'border-blue-600' : 'border-transparent'}`}
                    onClick={() => setActiveImage(img.image_url)}
                  >
                    <img 
                      src={img.image_url} 
                      alt="Imagem do imóvel" 
                      className="w-full h-20 object-cover" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações e contato */}
          <div className="md:w-1/3 mt-6 md:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <span className="inline-block bg-blue-600 text-black text-xs font-medium px-2 py-1 rounded mb-2">
                  {property.is_for_rent ? "Aluguel" : "Venda"}
                </span>
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <p className="text-gray-600">{property.city}, {property.state}</p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-600">
                  {formatCurrency(property.price)}
                  {property.is_for_rent && "/mês"}
                </h2>
              </div>
              
              <div className="border-t border-b py-4 my-4 grid grid-cols-3 gap-4">
                {property.bedrooms !== undefined && (
                  <div className="text-center">
                    <p className="text-xl font-semibold">{property.bedrooms}</p>
                    <p className="text-gray-600 text-sm">{property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</p>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="text-center">
                    <p className="text-xl font-semibold">{property.bathrooms}</p>
                    <p className="text-gray-600 text-sm">{property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</p>
                  </div>
                )}
                {property.area !== undefined && (
                  <div className="text-center">
                    <p className="text-xl font-semibold">{property.area}</p>
                    <p className="text-gray-600 text-sm">m²</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleContactClick}
                className="w-full text-lg py-6 mt-4"
              >
                Contatar o anunciante
              </Button>
            </div>
          </div>
        </div>
        
        {/* Descrição */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Descrição</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="whitespace-pre-line">{property.description || "Sem descrição disponível."}</p>
          </div>
        </div>
        
        {/* Detalhes */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Detalhes do imóvel</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-gray-600">Tipo</dt>
                <dd>{property.property_type}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Endereço</dt>
                <dd>{property.address || `${property.city}, ${property.state}`}</dd>
              </div>
              {property.bedrooms !== undefined && (
                <div>
                  <dt className="text-gray-600">Quartos</dt>
                  <dd>{property.bedrooms}</dd>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div>
                  <dt className="text-gray-600">Banheiros</dt>
                  <dd>{property.bathrooms}</dd>
                </div>
              )}
              {property.area !== undefined && (
                <div>
                  <dt className="text-gray-600">Área</dt>
                  <dd>{property.area} m²</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-600">ID do anúncio</dt>
                <dd>{property.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
