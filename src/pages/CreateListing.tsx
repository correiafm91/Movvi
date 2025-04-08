import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LocationSelector from "@/components/LocationSelector";
import Navbar from "@/components/Navbar";
import FirstPropertyAdModal from "@/components/FirstPropertyAdModal";
import { getProfile } from "@/services/auth";
import { createProperty } from "@/services/properties";
import { supabase } from "@/integrations/supabase/client";

const CreateListing = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState({ state: "", city: "" });
  const [propertyType, setPropertyType] = useState("Apartamento");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [listingType, setListingType] = useState<"rent" | "sale">("sale");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Acesso restrito",
          description: "Você precisa estar logado para anunciar um imóvel.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { profile } = await getProfile();
      if (profile?.phone) {
        setContact(profile.phone);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files) return;
    
    if (photos.length + files.length > 10) {
      toast({
        title: "Limite de fotos",
        description: "Você pode adicionar no máximo 10 fotos.",
        variant: "destructive",
      });
      return;
    }
    
    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];
    
    Array.from(files).forEach((file) => {
      newPhotos.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });
    
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];
    
    URL.revokeObjectURL(newPreviews[index]);
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !contact || !location.state || !location.city || photos.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e adicione pelo menos uma foto.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const propertyData = {
        title,
        description,
        price: Number(price.replace(/\D/g, '')) / 100,
        state: location.state,
        city: location.city,
        property_type: propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        area: area ? parseFloat(area) : undefined,
        is_for_rent: listingType === 'rent',
        contact_phone: contact,
        owner_id: (await supabase.auth.getUser()).data.user?.id
      };

      const result = await createProperty(propertyData, photos);
      
      if (result.success && result.data) {
        toast({
          title: "Anúncio criado",
          description: "Seu imóvel foi anunciado com sucesso!",
        });
        
        const { profile } = await getProfile();
        if (profile && (!profile.property_count || profile.property_count === 1)) {
          setShowAdModal(true);
        } else {
          navigate("/");
        }
      } else {
        throw result.error || new Error("Erro ao criar anúncio");
      }
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o anúncio. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    const cents = parseInt(numbers);
    if (isNaN(cents)) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(cents / 100);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPrice(value);
    setPrice(formattedValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-28 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Anunciar Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photos">Fotos do imóvel</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {photoPreviews.map((photo, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded overflow-hidden group"
                    >
                      <img 
                        src={photo} 
                        alt={`Imóvel ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                  
                  {photos.length < 10 && (
                    <div className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center aspect-square">
                      <Label 
                        htmlFor="photo-upload" 
                        className="cursor-pointer text-center p-4"
                      >
                        <div className="text-3xl text-gray-400">+</div>
                        <div className="text-sm text-gray-500">Adicionar foto</div>
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Adicione até 10 fotos do seu imóvel. A primeira foto será usada como capa do anúncio.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título do anúncio</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Apartamento 2 quartos no Centro"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição detalhada</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o imóvel em detalhes..."
                  rows={5}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo do imóvel</Label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Kitnet">Kitnet</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Rural">Rural</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ''))}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de anúncio</Label>
                <RadioGroup
                  value={listingType}
                  onValueChange={(value) => setListingType(value as "rent" | "sale")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sale" id="sale" disabled={isLoading} />
                    <Label htmlFor="sale">Venda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent" id="rent" disabled={isLoading} />
                    <Label htmlFor="rent">Aluguel</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">
                  Preço {listingType === "rent" ? "(mensal)" : ""}
                </Label>
                <Input
                  id="price"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="R$ 0,00"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Localização</Label>
                <LocationSelector onLocationChange={setLocation} disabled={isLoading} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">Telefone para contato</Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar Anúncio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <FirstPropertyAdModal open={showAdModal} onOpenChange={setShowAdModal} />
    </div>
  );
};

export default CreateListing;
