
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getProfile, signOut, updateProfile, uploadProfilePhoto, Profile } from "@/services/auth";

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRealtor, setIsRealtor] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateListingDialog, setShowCreateListingDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { profile, error } = await getProfile();
        
        if (error || !profile) {
          console.error("Erro ao buscar perfil:", error);
          navigate("/auth");
          return;
        }

        setProfile(profile);
        
        // Preencher os campos do formulário
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.photo_url) setPhotoUrl(profile.photo_url);
        if (profile.is_realtor !== undefined) setIsRealtor(profile.is_realtor);
        
        // Se o perfil não estiver completo, iniciar em modo de edição
        if (!profile.name || !profile.phone) {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    if (!name || !phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { success } = await updateProfile({
        name,
        phone,
        is_realtor: isRealtor,
        photo_url: photoUrl || undefined,
      });
      
      if (success) {
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name,
            phone,
            is_realtor: isRealtor,
            photo_url: photoUrl || undefined,
          };
        });
        
        setIsEditing(false);
        
        toast({
          title: "Perfil atualizado",
          description: "As informações do seu perfil foram atualizadas com sucesso!",
        });
        
        // Se for a primeira vez completando o perfil, mostrar diálogo de criação de anúncio
        if (!profile?.name || !profile?.phone) {
          setShowCreateListingDialog(true);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const { url, error } = await uploadProfilePhoto(file);
        
        if (error || !url) {
          throw error || new Error("Não foi possível fazer upload da foto");
        }
        
        setPhotoUrl(url);
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada.",
        });
      } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
        toast({
          title: "Erro",
          description: "Não foi possível fazer upload da foto.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-28 px-4 flex items-center justify-center">
          <p>Carregando perfil...</p>
        </div>
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
                      disabled={isLoading}
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
                    value={profile?.email || ""}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || isLoading}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing || isLoading}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="realtor"
                    checked={isRealtor}
                    onCheckedChange={setIsRealtor}
                    disabled={!isEditing || isLoading}
                  />
                  <Label htmlFor="realtor">Sou um corretor de imóveis</Label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
              {isEditing ? (
                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Perfil"}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    onClick={() => navigate("/create-listing")}
                    disabled={isLoading}
                  >
                    Anunciar Imóvel
                  </Button>
                </>
              )}
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                disabled={isLoading}
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo para perguntar se o usuário deseja criar um anúncio */}
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

export default ProfilePage;
