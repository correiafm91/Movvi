
import { useState, useEffect } from "react";
import { Property, getPropertiesByOwner } from "@/services/properties";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PropertySelectionProps {
  onSelectProperty: (property: Property) => void;
  onCancel: () => void;
}

export function PropertySelection({ onSelectProperty, onCancel }: PropertySelectionProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const userProperties = await getPropertiesByOwner();
        setProperties(userProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Você não possui imóveis cadastrados.</p>
        <Button onClick={onCancel}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">Selecione um imóvel para anunciar:</p>
      <div className="grid gap-4">
        {properties.map((property) => (
          <Card 
            key={property.id} 
            className="cursor-pointer hover:border-blue-400 transition-all"
            onClick={() => onSelectProperty(property)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-20 w-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0].image_url} 
                    alt={property.title} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{property.title}</h3>
                <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                <p className="text-sm font-semibold mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
