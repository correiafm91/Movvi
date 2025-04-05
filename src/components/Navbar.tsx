
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from './ui/use-toast';
import { HomeIcon } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saiu com sucesso",
      });
    }
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <img 
                src="https://i.postimg.cc/QxHJpJRq/487920932-1090659346410592-2968078890675727046-n.jpg" 
                alt="Movvi" 
                className="h-9 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hidden sm:flex items-center gap-1"
              onClick={goHome}
            >
              <HomeIcon size={18} />
              <span className="hidden lg:inline">Início</span>
            </Button>
            
            {/* Botão de anunciar (azul com fonte preta) */}
            <Link to="/create-listing">
              <Button className="bg-blue-500 hover:bg-blue-600 text-black">
                Anunciar
              </Button>
            </Link>
            
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/create-listing" className="cursor-pointer">
                      Anunciar imóvel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline">Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
