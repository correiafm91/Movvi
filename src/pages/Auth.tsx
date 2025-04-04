
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate authentication
    const user = {
      id: "user123",
      email,
      profileCompleted: false,
    };
    
    // Store user in localStorage (in a real app, you'd handle tokens properly)
    localStorage.setItem("user", JSON.stringify(user));
    
    toast({
      title: isLogin ? "Login bem-sucedido" : "Cadastro realizado",
      description: isLogin 
        ? "Bem-vindo de volta!" 
        : "Sua conta foi criada com sucesso.",
    });
    
    // If login successful, redirect to profile page to complete profile
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-28 pb-16 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Acesse sua conta para gerenciar seus anúncios" 
                : "Cadastre-se para anunciar seu imóvel"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">
                {isLogin ? "Entrar" : "Criar conta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>{isLogin ? "Entrar" : "Cadastrar"} com Google</span>
              </Button>
              <p className="text-center text-sm text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:underline"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Cadastre-se" : "Entrar"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
