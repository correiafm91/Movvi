
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { brazilianStates } from "@/lib/data";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Here you would typically handle the search functionality
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="Busque por cidade, estado ou bairro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="pl-4 pr-12 py-6 rounded-full shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          <Button 
            type="submit" 
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10"
          >
            <Search size={20} className="text-white" />
          </Button>
        </div>

        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brazilianStates.map((state) => (
                <div key={state.uf} className="space-y-2">
                  <h3 className="font-semibold text-gray-800">{state.name}</h3>
                  <ul className="space-y-1">
                    {state.mainCities.map((city) => (
                      <li key={city} className="text-sm">
                        <button 
                          className="hover:text-blue-600 text-gray-600 text-left w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchQuery(`${city}, ${state.uf}`);
                            setIsExpanded(false);
                          }}
                        >
                          {city}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
              className="mt-4 text-gray-600"
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
