
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";

type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  photo?: string;
  isRealtor?: boolean;
  profileCompleted?: boolean;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRealtor, setIsRealtor] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateListingDialog, setShowCreateListingDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/auth");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);
    
    // Pre-populate form fields if available
    if (parsedUser.name) setName(parsedUser.name);
    if (parsedUser.phone) setPhone(parsedUser.phone);
    if (parsedUser.photo) setPhotoUrl(parsedUser.photo);
    if (parsedUser.isRealtor !== undefined) setIsRealtor(parsedUser.isRealtor);
    
    // If profile not completed, set to editing mode
    if (!parsedUser.profileCompleted) {
      setIsEditing(true);
    }
  }, [navigate]);

  const handleProfileUpdate = () => {
    if (!name || !phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    // Update user in state and localStorage
    const updatedUser = {
      ...user,
      name,
      phone,
      isRealtor,
      photo: photoUrl || undefined,
      profileCompleted: true,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    setIsEditing(false);
    
    toast({
      title: "Perfil atualizado",
      description: "As informações do seu perfil foram atualizadas com sucesso!",
    });
    
    // If this is the first time completing the profile, show create listing dialog
    if (!user?.profileCompleted) {
      setShowCreateListingDialog(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    });
    navigate("/");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // For this demo, we'll use a local URL
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-28 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Perfil do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-28 h-28 border-2 border-gray-200">
                  <AvatarImage src={photoUrl} />
                  <AvatarFallback className="text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <Label 
                      htmlFor="photo" 
                      className="cursor-pointer text-sm text-blue-600 hover:underline"
                    >
                      Alterar foto
                    </Label>
                    <Input 
                      id="photo" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange} 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="realtor"
                    checked={isRealtor}
                    onCheckedChange={setIsRealtor}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="realtor">Sou um corretor de imóveis</Label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
              {isEditing ? (
                <Button onClick={handleProfileUpdate}>
                  Salvar Perfil
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    onClick={() => navigate("/create-listing")}
                  >
                    Anunciar Imóvel
                  </Button>
                </>
              )}
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog for asking if user wants to create a listing */}
      <AlertDialog open={showCreateListingDialog} onOpenChange={setShowCreateListingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja seguir com o anúncio?</AlertDialogTitle>
            <AlertDialogDescription>
              Seu perfil foi criado com sucesso! Deseja anunciar um imóvel agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/create-listing")}>
              Sim, anunciar imóvel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
