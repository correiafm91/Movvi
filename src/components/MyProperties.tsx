
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, HomeIcon } from "lucide-react";
import { Property, getPropertiesByOwner, deleteProperty } from "@/services/properties";
import { useToast } from "@/components/ui/use-toast";

const MyProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await getPropertiesByOwner();
        setProperties(data);
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus imóveis.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const handleEditProperty = (id: string) => {
    navigate(`/edit-property/${id}`);
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      setIsLoading(true);
      const { success } = await deleteProperty(id);
      
      if (success) {
        setProperties((prev) => prev.filter((prop) => prop.id !== id));
        toast({
          title: "Imóvel excluído",
          description: "O imóvel foi excluído com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o imóvel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return <p className="text-center py-8">Carregando seus imóveis...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meus imóveis</h2>
        <Button onClick={() => navigate("/create-listing")} className="animate-fade-in">
          Anunciar novo imóvel
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card className="bg-gray-50 border border-dashed animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <HomeIcon className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-center">
              Você ainda não possui imóveis anunciados.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/create-listing")}
            >
              Criar seu primeiro anúncio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => {
            const mainImage = property.images?.find(img => img.is_main)?.image_url || 
                             property.images?.[0]?.image_url || 
                             '/placeholder.svg';
                             
            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-md transition-all duration-200 animate-fade-in">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={mainImage} 
                    alt={property.title} 
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(`/property/${property.id}`)}
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-black text-xs font-medium px-2 py-1 rounded">
                    {property.is_for_rent ? "Aluguel" : "Venda"}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm mb-2">{property.city}, {property.state}</p>
                  <p className="font-bold text-lg text-blue-600">
                    R$ {property.price.toLocaleString('pt-BR')}
                    {property.is_for_rent ? "/mês" : ""}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditProperty(property.id)}
                    className="flex items-center gap-1"
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-1"
                    onClick={() => setDeleteConfirm(property.id)}
                  >
                    <Trash size={16} /> Excluir
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteProperty(deleteConfirm)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyProperties;
