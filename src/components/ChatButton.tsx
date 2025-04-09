
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { startChatWithPropertyOwner } from "@/services/chat";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ChatButtonProps {
  propertyId: string;
  ownerName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export default function ChatButton({
  propertyId,
  ownerName,
  variant = "default",
  size = "default",
  fullWidth = false,
  className = "",
}: ChatButtonProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [sending, setSending] = useState(false);

  const handleStartChat = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, digite uma mensagem para iniciar a conversa.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { roomId, error } = await startChatWithPropertyOwner(
        propertyId,
        message.trim()
      );

      if (roomId) {
        toast({
          title: "Mensagem enviada",
          description: `Sua mensagem foi enviada para ${ownerName || "o anunciante"}.`,
        });
        setDialogOpen(false);
        setMessage("");
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Ocorreu um erro ao tentar enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      // For non-logged in users, open dialog to collect message and optional name
      setDialogOpen(true);
    } else {
      // For logged in users, open dialog to collect message
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${fullWidth ? "w-full" : ""} ${
          variant === "default" ? "bg-blue-600 hover:bg-blue-700" : ""
        } ${className}`}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Enviar mensagem
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensagem ao anunciante</DialogTitle>
            <DialogDescription>
              {ownerName
                ? `Envie uma mensagem para ${ownerName} sobre este imóvel.`
                : "Envie uma mensagem para o anunciante deste imóvel."}
            </DialogDescription>
          </DialogHeader>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome (opcional)</Label>
              <Input
                id="name"
                placeholder="Como deseja ser chamado?"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStartChat}
              disabled={sending || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? "Enviando..." : "Enviar mensagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
