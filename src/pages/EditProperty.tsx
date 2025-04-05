
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationSelector from "@/components/LocationSelector";
import Navbar from "@/components/Navbar";
import { getPropertyById, updateProperty, Property } from "@/services/properties";

const propertyTypes = [
  "Apartamento",
  "Casa",
  "Cobertura",
  "Terreno",
  "Sala Comercial",
  "Galpão",
  "Sítio",
  "Chácara",
  "Fazenda",
  "Prédio",
  "Loja",
];

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [location, setLocation] = useState({ state: "", city: "" });
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [area, setArea] = useState<number | "">("");
  const [isForRent, setIsForRent] = useState(false);
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const propData = await getPropertyById(id);
        if (!propData) {
          toast({
            title: "Erro",
            description: "Imóvel não encontrado",
            variant: "destructive",
          });
          navigate("/profile");
          return;
        }
        
        setProperty(propData);
        
        // Fill form with property data
        setTitle(propData.title);
        setDescription(propData.description || "");
        setPrice(propData.price);
        setLocation({ state: propData.state, city: propData.city });
        setAddress(propData.address || "");
        setPropertyType(propData.property_type);
        setBedrooms(propData.bedrooms || "");
        setBathrooms(propData.bathrooms || "");
        setArea(propData.area || "");
        setIsForRent(propData.is_for_rent);
        setContactPhone(propData.contact_phone || "");
      } catch (error) {
        console.error("Erro ao carregar imóvel:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as informações do imóvel",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !location.state || !location.city || !price || !propertyType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { success } = await updateProperty(id!, {
        title,
        description,
        price: Number(price),
        state: location.state,
        city: location.city,
        address,
        property_type: propertyType,
        bedrooms: bedrooms === "" ? undefined : Number(bedrooms),
        bathrooms: bathrooms === "" ? undefined : Number(bathrooms),
        area: area === "" ? undefined : Number(area),
        is_for_rent: isForRent,
        contact_phone: contactPhone,
      });

      if (success) {
        toast({
          title: "Imóvel atualizado",
          description: "As informações do imóvel foram atualizadas com sucesso",
        });
        navigate("/profile");
      }
    } catch (error) {
      console.error("Erro ao atualizar imóvel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o imóvel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-28 px-4 flex items-center justify-center">
          <p>Carregando informações do imóvel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      <div className="container mx-auto py-28 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Editar Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="font-medium">
                    Título do anúncio*
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Apartamento de 2 quartos no Centro"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o imóvel, incluindo características especiais, localização, etc."
                    rows={5}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <Label htmlFor="price" className="font-medium">
                      Preço*
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Valor do imóvel"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center h-full pt-6">
                      <Switch
                        id="isForRent"
                        checked={isForRent}
                        onCheckedChange={setIsForRent}
                        disabled={isLoading}
                      />
                      <Label htmlFor="isForRent" className="ml-2">
                        Este imóvel é para aluguel
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Localização*</Label>
                  <LocationSelector
                    onLocationChange={setLocation}
                    initialState={location.state}
                    initialCity={location.city}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="font-medium">
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, etc."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType" className="font-medium">
                    Tipo de imóvel*
                  </Label>
                  <Select
                    value={propertyType}
                    onValueChange={setPropertyType}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms" className="font-medium">
                      Quartos
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Nº de quartos"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms" className="font-medium">
                      Banheiros
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Nº de banheiros"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area" className="font-medium">
                      Área (m²)
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      min="0"
                      value={area}
                      onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Área em m²"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactPhone" className="font-medium">
                    Telefone para contato
                  </Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProperty;
