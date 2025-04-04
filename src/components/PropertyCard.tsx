
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type PropertyCardProps = {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  beds?: number;
  baths?: number;
  squareMeters?: number;
  isForRent: boolean;
};

const PropertyCard = ({
  id,
  title,
  location,
  price,
  imageUrl,
  beds,
  baths,
  squareMeters,
  isForRent,
}: PropertyCardProps) => {
  return (
    <Link to={`/property/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="aspect-[4/3] w-full relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-blue-600 text-black text-xs font-medium px-2 py-1 rounded">
            {isForRent ? "Aluguel" : "Venda"}
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
          <p className="text-gray-500 text-sm mb-3">{location}</p>
          <div className="mt-auto">
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              {beds !== undefined && (
                <div>
                  <span className="font-medium">{beds}</span> {beds === 1 ? "quarto" : "quartos"}
                </div>
              )}
              {baths !== undefined && (
                <div>
                  <span className="font-medium">{baths}</span> {baths === 1 ? "banheiro" : "banheiros"}
                </div>
              )}
              {squareMeters !== undefined && (
                <div>
                  <span className="font-medium">{squareMeters}</span> m²
                </div>
              )}
            </div>
            <p className="font-bold text-lg text-blue-600">
              {formatCurrency(price)}{isForRent ? "/mês" : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
