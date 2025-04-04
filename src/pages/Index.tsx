
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { getProperties, Property } from "@/services/properties";

const Index = () => {
  const [filter, setFilter] = useState("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    query: "",
    location: { state: "", city: "" }
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await getProperties({ 
          type: filter === "all" ? "all" : filter === "rent" ? "rent" : "sale" 
        });
        setProperties(data);
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filter]);

  const handleSearch = (query: string, location: { state: string; city: string }) => {
    setSearchParams({ query, location });
    
    // Filter properties based on search parameters
    let filteredProperties = properties;
    
    // Filter by location
    if (location.state) {
      filteredProperties = filteredProperties.filter(prop => 
        prop.state.toLowerCase() === location.state.toLowerCase()
      );
    }
    
    if (location.city) {
      filteredProperties = filteredProperties.filter(prop => 
        prop.city.toLowerCase() === location.city.toLowerCase()
      );
    }
    
    // Filter by query text (search in title, description, property_type)
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredProperties = filteredProperties.filter(prop => 
        prop.title.toLowerCase().includes(searchQuery) || 
        (prop.description && prop.description.toLowerCase().includes(searchQuery)) ||
        prop.property_type.toLowerCase().includes(searchQuery)
      );
    }
    
    setProperties(filteredProperties);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Compre, alugue ou anuncie imóveis de maneira simples e rápida na plataforma Movvi
            </p>
          </div>
          
          <div className="mt-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Imóveis em destaque</h2>
            <div className="flex space-x-2 border rounded-lg overflow-hidden">
              <button
                className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              <button
                className={`px-4 py-2 text-sm ${filter === 'buy' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setFilter('buy')}
              >
                Comprar
              </button>
              <button
                className={`px-4 py-2 text-sm ${filter === 'rent' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setFilter('rent')}
              >
                Alugar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Carregando imóveis...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-600 mb-6">Seja o primeiro a anunciar um imóvel!</p>
              <Link 
                to="/create-listing"
                className="bg-blue-600 text-black px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Anunciar agora
              </Link>
            </div>
          ) : (
            <PropertyList properties={properties} />
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Tem um imóvel para anunciar?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e anuncie seu imóvel para milhares de pessoas interessadas em comprar ou alugar.
          </p>
          <Link 
            to="/auth" 
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Anuncie agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Movvi</h3>
              <p className="text-gray-400">
                A plataforma mais moderna para compra, venda e aluguel de imóveis no Brasil.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Links Úteis</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white">Entrar</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white">Cadastrar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contato</h3>
              <p className="text-gray-400">contato@movvi.com</p>
              <p className="text-gray-400">+55 (11) 99999-9999</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Movvi. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const PropertyList = ({ properties }: { properties: Property[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.length > 0 ? (
        properties.map((property) => {
          const mainImage = property.images?.find(img => img.is_main)?.image_url || 
                           property.images?.[0]?.image_url || 
                           '/placeholder.svg';
          
          return (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              price={property.price}
              location={`${property.city}, ${property.state}`}
              beds={property.bedrooms}
              baths={property.bathrooms}
              squareMeters={property.area}
              imageUrl={mainImage}
              isForRent={property.is_for_rent}
            />
          );
        })
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-lg text-gray-500">Nenhum imóvel encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default Index;
