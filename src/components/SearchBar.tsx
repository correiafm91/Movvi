
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowDown, ArrowUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Slider
} from "@/components/ui/slider";
import LocationSelector from './LocationSelector';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchBarProps {
  onSearch?: (
    query: string, 
    location: { state: string; city: string },
    priceRange: { min: number | null; max: number | null }
  ) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState({ state: '', city: '' });
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Buscando por:", { query, location, priceRange });
    if (onSearch) {
      onSearch(query, location, {
        min: minPrice ? Number(minPrice) : null,
        max: maxPrice ? Number(maxPrice) : null
      });
    }
    setFiltersOpen(false);
  };

  return (
    <div className="w-full rounded-lg bg-white shadow-lg p-4 sm:p-6 animate-fade-in">
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
        
        <div className="flex items-center gap-2">
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Filter size={18} />
                <span>Filtros</span>
                {filtersOpen ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 w-full md:w-[400px]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Faixa de preço</h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full"
                        min={0}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Máximo"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  onClick={handleSearch}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button type="submit" className="flex items-center gap-2 ml-auto">
            <Search size={18} />
            <span>Buscar</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
