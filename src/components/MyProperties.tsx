import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPropertiesByOwner,
  deleteProperty,
  Property,
} from "@/services/properties";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const MyProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      if (user && user.id) {
        const ownerId = user.id;
        const userProperties = await getPropertiesByOwner(ownerId);
        setProperties(userProperties);
      }
    };

    fetchProperties();
  }, [user]);

  const handleDelete = async (id: string) => {
    const result = await deleteProperty(id);
    if (result) {
      toast({
        title: "Sucesso",
        description: "Imóvel deletado com sucesso!",
      });
      setProperties(properties.filter((property) => property.id !== id));
    } else {
      toast({
        title: "Erro",
        description: "Erro ao deletar o imóvel.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Meus Imóveis</CardTitle>
          <CardDescription>
            Gerencie seus imóveis cadastrados na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Título</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>{property.state}</TableCell>
                  <TableCell>{property.price}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      Deletar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4">
        <Link to="/create-listing">
          <Button>Adicionar Novo Imóvel</Button>
        </Link>
      </div>
    </div>
  );
};

export default MyProperties;
