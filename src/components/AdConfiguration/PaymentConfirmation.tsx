
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Check, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Property, markPropertyAsFeatured } from "@/services/properties";

interface PaymentConfirmationProps {
  property: Property;
  days: number;
  amount: number;
  onPrevious: () => void;
  onComplete: () => void;
}

// PIX codes for different day counts
const PIX_CODES = {
  1: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d520400005303986540550.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510dgR8nA5KUB63042984",
  2: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406100.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510jycjcYg93G6304DEAE",
  3: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406150.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510uUKDLwqhFD63049FF7",
  4: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406200.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510sMNM3uYEDc63048B21",
  5: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406250.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510UXD6b6YFlz63048F48",
  6: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406300.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510Kqh2AIACKj63041537",
  7: "00020126580014BR.GOV.BCB.PIX0136c15480dc-2384-4438-9ed3-76878f6ad36d5204000053039865406350.005802BR5925Luis Gustavo Correia Frei6009SAO PAULO62140510sxiXQlL3TP6304087B"
};

export function PaymentConfirmation({ property, days, amount, onPrevious, onComplete }: PaymentConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const pixCode = PIX_CODES[days as keyof typeof PIX_CODES] || PIX_CODES[1];
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({ title: "Código PIX copiado!" });
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  
  const confirmPayment = async () => {
    setLoading(true);
    
    try {
      // Mark the property as featured for the specified number of days
      await markPropertyAsFeatured(property.id, days);
      
      // Simulate payment processing
      setTimeout(() => {
        setLoading(false);
        setCompleted(true);
      }, 2000);
    } catch (error) {
      console.error("Error marking property as featured:", error);
      toast({ 
        title: "Erro ao processar pagamento", 
        description: "Tente novamente mais tarde.",
        variant: "destructive" 
      });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete]);

  if (completed) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold">Pagamento recebido!</h3>
        <p className="text-gray-600">
          Anúncio em análise, ficará disponível em 24 horas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Imóvel:</span>
          <span className="truncate max-w-[200px]">{property.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Duração:</span>
          <span>{days} {days === 1 ? 'dia' : 'dias'}</span>
        </div>
        <div className="flex justify-between mt-2 font-bold">
          <span>Total a pagar:</span>
          <span>R$ {amount.toFixed(2)}</span>
        </div>
      </div>
      
      <div>
        <div className="text-center mb-4">
          <h3 className="font-medium text-lg">Pague com PIX</h3>
          <p className="text-sm text-gray-500">Copie o código abaixo e pague no seu banco</p>
        </div>
        
        <div className="border rounded-md p-3 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Código PIX:</p>
          <div className="relative">
            <div className="border rounded p-3 bg-white pr-10 overflow-hidden">
              <p className="text-sm break-all text-gray-700 font-mono">{pixCode}</p>
            </div>
            <button 
              className="absolute right-2 top-3 text-blue-600 hover:text-blue-800" 
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <ClipboardCopy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious} disabled={loading}>
          Voltar
        </Button>
        <Button onClick={confirmPayment} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar pagamento"
          )}
        </Button>
      </div>
    </div>
  );
}
