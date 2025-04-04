
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LocationSelector from './LocationSelector';

const SearchBar = () => {
  const [location, setLocation] = useState({ state: '', city: '' });
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Buscando por:", { query, location });
    // Implemente a busca aqui
  };

  return (
    <div className="w-full rounded-lg bg-white shadow-lg p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por tipo, endereço, características..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <LocationSelector onLocationChange={setLocation} />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Search size={18} />
            <span>Buscar</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
