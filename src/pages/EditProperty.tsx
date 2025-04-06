import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Property, getPropertyById, updateProperty } from "@/services/properties";
import Navbar from "@/components/Navbar";
import { useUser } from "@/hooks/use-user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Título deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres.",
  }),
  state: z.string().min(2, {
    message: "Estado deve ter pelo menos 2 caracteres.",
  }),
  price: z.number().min(1, {
    message: "Preço deve ser maior que zero.",
  }),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  property_type: z.string().min(3, {
    message: "Tipo de imóvel deve ter pelo menos 3 caracteres.",
  }),
  contact_phone: z.string().optional(),
  is_for_rent: z.boolean().default(false),
});

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        const fetchedProperty = await getPropertyById(id);
        if (fetchedProperty) {
          setProperty(fetchedProperty);
        } else {
          toast({
            title: "Imóvel não encontrado.",
            description: "Não foi possível encontrar o imóvel com o ID especificado.",
            variant: "destructive",
          });
          navigate("/");
        }
      }
    };

    fetchProperty();
  }, [id, navigate, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: property ? zodResolver(formSchema) : undefined,
    defaultValues: {
      title: property?.title || "",
      description: property?.description || "",
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      price: property?.price || 0,
      bedrooms: property?.bedrooms || 0,
      bathrooms: property?.bathrooms || 0,
      area: property?.area || 0,
      property_type: property?.property_type || "",
      contact_phone: property?.contact_phone || "",
      is_for_rent: property?.is_for_rent || false,
    },
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        description: property.description || "",
        address: property.address || "",
        city: property.city,
        state: property.state,
        price: property.price,
        bedrooms: property.bedrooms || undefined,
        bathrooms: property.bathrooms || undefined,
        area: property.area || undefined,
        property_type: property.property_type,
        contact_phone: property.contact_phone || "",
        is_for_rent: property.is_for_rent,
      });
    }
  }, [property, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) {
      toast({
        title: "Erro",
        description: "ID do imóvel não especificado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = {
        ...values,
        price: Number(values.price),
        bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
        bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
        area: values.area ? Number(values.area) : undefined,
      };

      const result = await updateProperty(id, formData);

      if (result?.success) {
        toast({
          title: "Sucesso",
          description: "Imóvel atualizado com sucesso!",
        });
        navigate(`/property/${id}`);
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar o imóvel.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar o imóvel:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao atualizar o imóvel.",
        variant: "destructive",
      });
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Carregando imóvel...</h2>
            <p className="text-gray-600">Aguarde enquanto buscamos os detalhes do imóvel.</p>
          </div>
        </div>
      </div>
    );
  }

  if (user?.id !== property.owner_id) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
            <p className="text-gray-600">Você não tem permissão para editar este imóvel.</p>
            <Link to="/" className="text-blue-500">Voltar para a página inicial</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Editar Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título do imóvel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Imóvel</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Apartamento, Casa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="Estado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Preço" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone para contato</FormLabel>
                        <FormControl>
                          <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartos</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Número de quartos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banheiros</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Número de banheiros" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Área em metros quadrados" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição detalhada do imóvel"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_for_rent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Disponível para Aluguel</FormLabel>
                        {/* <FormDescription>
                          Marque se este imóvel está disponível para aluguel.
                        </FormDescription> */}
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit">Atualizar Imóvel</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProperty;
