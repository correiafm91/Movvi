
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  imageUrl: string;
  isForRent?: boolean;
}

const PropertyCard = ({
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  isForRent = false,
}: PropertyCardProps) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Card className="overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md group">
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge 
          className={`absolute top-2 left-2 ${isForRent ? 'bg-blue-600' : 'bg-green-600'}`}
        >
          {isForRent ? 'Aluguel' : 'Venda'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
        <p className="text-xl font-bold text-blue-600 my-1">
          {formattedPrice}
          {isForRent && <span className="text-sm font-normal text-gray-600 ml-1">/mês</span>}
        </p>
        <div className="flex items-center text-gray-600 text-sm my-2">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        {(bedrooms || bathrooms || area) && (
          <div className="flex items-center gap-3 text-sm text-gray-600 mt-3 border-t pt-3">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">{bedrooms}</span>
                <span>{bedrooms === 1 ? 'quarto' : 'quartos'}</span>
              </div>
            )}
            
            {bathrooms && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">{bathrooms}</span>
                <span>{bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
              </div>
            )}
            
            {area && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">{area}</span>
                <span>m²</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
