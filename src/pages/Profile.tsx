import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import MyProperties from "@/components/MyProperties";
import { getProfile, signOut, updateProfile, uploadProfilePhoto, Profile } from "@/services/auth";
import { Award, ExternalLink } from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRealtor, setIsRealtor] = useState(false);
  const [creciCode, setCreciCode] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCreateListingDialog, setShowCreateListingDialog] = useState(false);
  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
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
        
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.photo_url) setPhotoUrl(profile.photo_url);
        if (profile.is_realtor !== undefined) setIsRealtor(profile.is_realtor);
        if (profile.creci_code) setCreciCode(profile.creci_code);
        
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

    if (isRealtor && !creciCode) {
      toast({
        title: "Código CRECI obrigatório",
        description: "Como corretor, você precisa informar seu código CRECI.",
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
        creci_code: isRealtor ? creciCode : null,
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
            creci_code: isRealtor ? creciCode : null,
            photo_url: photoUrl || undefined,
          };
        });
        
        setIsEditing(false);
        
        toast({
          title: "Perfil atualizado",
          description: "As informações do seu perfil foram atualizadas com sucesso!",
        });
        
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

  const handleSponsorClick = () => {
    setShowSponsorDialog(true);
  };

  const handleSponsorRedirect = () => {
    window.open("https://form.respondi.app/pgdUo1tO", "_blank");
    setShowSponsorDialog(false);
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
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      <div className="container mx-auto py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Minha Conta</h1>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="properties">Meus Imóveis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="animate-fade-in">
              <Card>
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
                      
                      {isRealtor && (
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="creci">Código CRECI</Label>
                          <Input
                            id="creci"
                            value={creciCode}
                            onChange={(e) => setCreciCode(e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Seu código CRECI"
                          />
                        </div>
                      )}
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
            </TabsContent>
            
            <TabsContent value="properties" className="animate-fade-in">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Meus Imóveis</CardTitle>
                  {isRealtor && (
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={handleSponsorClick}
                    >
                      <Award size={16} className="text-blue-600" /> Seja patrocinado
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <MyProperties />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
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

      <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Ganhe visibilidade. Aumente suas vendas.
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Tenha seu perfil em destaque nas principais áreas da plataforma Movvi. 
              Conquiste a confiança dos clientes e aumente suas chances de fechar negócio com mais rapidez.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Como funciona?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Preencha o formulário Movvi</h4>
                  <p className="text-sm text-gray-600">Envie seus dados e manifeste seu interesse.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Envie suas informações completas</h4>
                  <p className="text-sm text-gray-600">Nossa equipe analisará seu perfil para garantir a qualidade dos destaques.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Seja um corretor patrocinado</h4>
                  <p className="text-sm text-gray-600">Com o selo de destaque, seu perfil será priorizado em áreas estratégicas da plataforma.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSponsorRedirect}
            >
              Tornar-me patrocinado <ExternalLink size={16} className="ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
