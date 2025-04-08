
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

interface FirstPropertyAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FirstPropertyAdModal = ({ open, onOpenChange }: FirstPropertyAdModalProps) => {
  const navigate = useNavigate();

  const handleCreateAd = () => {
    onOpenChange(false);
    navigate("/profile", { state: { openSponsorDialog: true } });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Parabéns pelo seu primeiro anúncio!</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Quer aumentar suas chances de fechar negócios? Crie um anúncio pago para destacar seu imóvel 
            e alcançar mais pessoas interessadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Agora não</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreateAd}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Configurar um anúncio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FirstPropertyAdModal;
