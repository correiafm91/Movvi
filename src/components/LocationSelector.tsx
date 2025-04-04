
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { brazilianStates } from '@/lib/data';

interface LocationSelectorProps {
  onLocationChange: (location: { state: string; city: string }) => void;
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, disabled }) => {
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (selectedState) {
      // Buscar o estado selecionado no array de estados brasileiros
      const stateData = brazilianStates.find(state => state.name === selectedState);
      if (stateData) {
        setAvailableCities(stateData.mainCities);
      } else {
        setAvailableCities([]);
      }
      setSelectedCity("");
    } else {
      setAvailableCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  useEffect(() => {
    onLocationChange({
      state: selectedState,
      city: selectedCity,
    });
  }, [selectedState, selectedCity, onLocationChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="state">Estado</Label>
        <select
          id="state"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          disabled={disabled}
        >
          <option value="">Selecione um estado</option>
          {brazilianStates.map((state) => (
            <option key={state.uf} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Cidade</Label>
        <select
          id="city"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedState || disabled}
        >
          <option value="">Selecione uma cidade</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
