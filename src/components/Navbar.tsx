
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, Home } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-10 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-white/80 backdrop-blur-md py-4"}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">Movvi</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
              <Home size={18} />
              <span>Início</span>
            </Button>
          </Link>
          
          {isLoggedIn ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User size={20} />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LogIn size={18} />
                <span>Entrar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
