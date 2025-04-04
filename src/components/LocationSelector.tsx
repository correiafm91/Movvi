
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  onLocationChange: (location: { state: string; city: string }) => void;
  disabled?: boolean;
}

const states = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
  "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
  "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
];

// Lista de cidades por estado (simplificada)
const cities: { [key: string]: string[] } = {
  "São Paulo": ["São Paulo", "Campinas", "Guarulhos", "São Bernardo do Campo", "Santo André"],
  "Rio de Janeiro": ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu"],
  "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Uberaba"],
  // Adicione mais estados conforme necessário
};

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, disabled }) => {
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (selectedState) {
      if (cities[selectedState]) {
        setAvailableCities(cities[selectedState]);
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
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
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
