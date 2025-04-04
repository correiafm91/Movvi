
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brazilianStates } from "@/lib/data";

interface LocationSelectorProps {
  onLocationChange: (location: { state: string; city: string }) => void;
  currentState?: string;
  currentCity?: string;
}

const LocationSelector = ({ 
  onLocationChange,
  currentState = "",
  currentCity = ""
}: LocationSelectorProps) => {
  const [selectedState, setSelectedState] = useState(currentState);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    onLocationChange({ state: value, city: "" });
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    onLocationChange({ state: selectedState, city: value });
  };

  const currentStateObj = brazilianStates.find(state => state.uf === selectedState);
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <Select value={selectedState} onValueChange={handleStateChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Estados</SelectLabel>
              {brazilianStates.map((state) => (
                <SelectItem key={state.uf} value={state.uf}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedState && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cidades</SelectLabel>
                {currentStateObj?.mainCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
