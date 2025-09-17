import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search programs..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className={`search-glow rounded-2xl overflow-hidden ${isFocused ? 'ring-2 ring-neon-purple/60' : ''}`}>
        <div className="relative bg-gradient-to-r from-dark-surface to-dark-charcoal border border-white/10">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neon-blue w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-12 pr-12 bg-transparent border-0 text-white placeholder:text-white/50 
                     focus:ring-0 focus:border-0 font-medium
                     h-14 rounded-2xl text-lg"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 text-white/70 hover:text-neon-pink hover:bg-neon-pink/10 rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}