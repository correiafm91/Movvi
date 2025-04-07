
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Property } from "@/services/properties";

interface BudgetConfigurationProps {
  property: Property;
  onPrevious: () => void;
  onNext: (days: number, amount: number) => void;
}

export function BudgetConfiguration({ property, onPrevious, onNext }: BudgetConfigurationProps) {
  const [days, setDays] = useState(1);
  const dailyRate = 50;
  const amount = days * dailyRate;
  
  const handleDaysChange = (value: number[]) => {
    setDays(value[0]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
        <h3 className="font-medium mb-2">Imóvel selecionado:</h3>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
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
          <div>
            <p className="font-medium">{property.title}</p>
            <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Escolha seu orçamento</h3>
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm font-medium">Duração do anúncio</span>
              <span className="text-sm font-semibold text-blue-600">{days} {days === 1 ? 'dia' : 'dias'}</span>
            </div>
            <Slider 
              value={[days]} 
              min={1} 
              max={7} 
              step={1} 
              onValueChange={handleDaysChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>1 dia</span>
              <span>7 dias</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Valor diário:</span>
              <span>R$ {dailyRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Valor total:</span>
              <span>R$ {amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Método de pagamento</p>
            <div className="flex items-center gap-2 border rounded-md p-3 bg-white">
              <div className="h-6 w-6 bg-green-500 text-white flex items-center justify-center rounded-full text-xs font-bold">
                P
              </div>
              <span className="font-medium">PIX</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <Button onClick={() => onNext(days, amount)}>
          Avançar
        </Button>
      </div>
    </div>
  );
}
