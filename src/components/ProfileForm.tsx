
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Profile, updateProfile, uploadProfilePhoto } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";
import { Building, Calendar, MapPin, User } from "lucide-react";

interface ProfileFormProps {
  profile: Profile | null;
  isEditing: boolean;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onEdit: () => void;
  onCancel: () => void;
}

const ProfileForm = ({ 
  profile, 
  isEditing, 
  isLoading, 
  onSave, 
  onEdit, 
  onCancel 
}: ProfileFormProps) => {
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || "");
  const [isRealtor, setIsRealtor] = useState(profile?.is_realtor || false);
  const [isAgency, setIsAgency] = useState(profile?.is_agency || false);
  const [creciCode, setCreciCode] = useState(profile?.creci_code || "");
  const [cnpj, setCnpj] = useState(profile?.cnpj || "");
  const [workState, setWorkState] = useState(profile?.work_state || "");
  const [workCity, setWorkCity] = useState(profile?.work_city || "");
  const [schedulingLink, setSchedulingLink] = useState(profile?.scheduling_link || "");
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (isAgency && !cnpj) {
      toast({
        title: "CNPJ obrigatório",
        description: "Como imobiliária, você precisa informar seu CNPJ.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfile({
        name,
        phone,
        is_realtor: isRealtor,
        is_agency: isAgency,
        creci_code: isRealtor ? creciCode : null,
        cnpj: isAgency ? cnpj : null,
        work_state: (isRealtor || isAgency) ? workState : null,
        work_city: (isRealtor || isAgency) ? workCity : null,
        scheduling_link: (isRealtor || isAgency) ? schedulingLink : null,
        photo_url: photoUrl || undefined,
      });
      
      onSave();
      
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-28 h-28 border-2 border-gray-200">
            <AvatarImage src={photoUrl} />
            <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
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
            <Label htmlFor="name" className="flex items-center">
              <User size={16} className="mr-1" /> Nome completo
            </Label>
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
              disabled={!isEditing || isLoading || isAgency}
            />
            <Label htmlFor="realtor">Sou um corretor de imóveis</Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="agency"
              checked={isAgency}
              onCheckedChange={(checked) => {
                setIsAgency(checked);
                if (checked) {
                  // If agency is checked, realtor should be unchecked
                  setIsRealtor(false);
                }
              }}
              disabled={!isEditing || isLoading || isRealtor}
            />
            <Label htmlFor="agency">Sou uma imobiliária</Label>
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

          {isAgency && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="cnpj" className="flex items-center">
                <Building size={16} className="mr-1" /> CNPJ
              </Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                disabled={!isEditing || isLoading}
                placeholder="XX.XXX.XXX/XXXX-XX"
              />
            </div>
          )}
          
          {(isRealtor || isAgency) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workState" className="flex items-center">
                    <MapPin size={16} className="mr-1" /> Estado de atuação
                  </Label>
                  <Input
                    id="workState"
                    value={workState}
                    onChange={(e) => setWorkState(e.target.value)}
                    disabled={!isEditing || isLoading}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workCity" className="flex items-center">
                    <MapPin size={16} className="mr-1" /> Cidade de atuação
                  </Label>
                  <Input
                    id="workCity"
                    value={workCity}
                    onChange={(e) => setWorkCity(e.target.value)}
                    disabled={!isEditing || isLoading}
                    placeholder="Ex: São Paulo"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedulingLink" className="flex items-center">
                  <Calendar size={16} className="mr-1" /> Link para agendamento
                </Label>
                <Input
                  id="schedulingLink"
                  value={schedulingLink}
                  onChange={(e) => setSchedulingLink(e.target.value)}
                  disabled={!isEditing || isLoading}
                  placeholder="Ex: https://calendly.com/seu-nome"
                />
                {schedulingLink && isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Você pode usar serviços como Calendly, Google Calendar ou outros para criar um link de agendamento.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
        {isEditing ? (
          <>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </>
        ) : (
          <Button 
            type="button"
            variant="outline" 
            onClick={onEdit}
            disabled={isLoading}
          >
            Editar Perfil
          </Button>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;
