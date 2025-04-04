
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LocationSelector from "@/components/LocationSelector";
import Navbar from "@/components/Navbar";

const CreateListing = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState({ state: "", city: "" });
  const [listingType, setListingType] = useState<"rent" | "sale">("sale");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user from localStorage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;

  if (!user) {
    // Redirect to auth if no user is logged in
    navigate("/auth");
    return null;
  }

  // Pre-populate contact with user's phone if available
  useState(() => {
    if (user?.phone) {
      setContact(user.phone);
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files) return;
    
    // Limit to 10 images
    if (photos.length + files.length > 10) {
      toast({
        title: "Limite de fotos",
        description: "Você pode adicionar no máximo 10 fotos.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would upload these to a server
    // For demo purposes, we'll use local URLs
    const newPhotos = [...photos];
    
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newPhotos.push(url);
    });
    
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !price || !contact || !location.state || !location.city || photos.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e adicione pelo menos uma foto.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, we would send this data to a backend
    toast({
      title: "Anúncio criado",
      description: "Seu imóvel foi anunciado com sucesso!",
    });
    
    // Redirect to home page
    navigate("/");
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
              {/* Photo upload */}
              <div className="space-y-2">
                <Label htmlFor="photos">Fotos do imóvel</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {photos.map((photo, index) => (
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
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Adicione até 10 fotos do seu imóvel. A primeira foto será usada como capa do anúncio.
                </p>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título do anúncio</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Apartamento 2 quartos no Centro"
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição detalhada</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o imóvel em detalhes..."
                  rows={5}
                />
              </div>
              
              {/* Type of listing */}
              <div className="space-y-2">
                <Label>Tipo de anúncio</Label>
                <RadioGroup
                  value={listingType}
                  onValueChange={(value) => setListingType(value as "rent" | "sale")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sale" id="sale" />
                    <Label htmlFor="sale">Venda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent" id="rent" />
                    <Label htmlFor="rent">Aluguel</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Preço {listingType === "rent" ? "(mensal)" : ""}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label>Localização</Label>
                <LocationSelector onLocationChange={setLocation} />
              </div>
              
              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact">Telefone para contato</Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Publicar Anúncio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;
