import { useState, useEffect } from "react";
import { Search, X, Filter, Calendar, Star, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SearchFilters {
  query: string;
  genres: string[];
  yearRange: [number, number];
  ratingRange: [number, number];
  type: 'all' | 'movie' | 'series';
  status: 'all' | 'ongoing' | 'completed' | 'cancelled';
  favorites: boolean;
  watchProgress: 'all' | 'unwatched' | 'watching' | 'completed';
}

interface AdvancedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  availableGenres: string[];
  placeholder?: string;
}

const initialFilters: SearchFilters = {
  query: "",
  genres: [],
  yearRange: [1900, new Date().getFullYear()],
  ratingRange: [0, 10],
  type: 'all',
  status: 'all',
  favorites: false,
  watchProgress: 'all'
};

export function AdvancedSearchBar({ 
  onSearch, 
  availableGenres, 
  placeholder = "Buscar programas..." 
}: AdvancedSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isFocused, setIsFocused] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    onSearch(initialFilters);
    setIsFiltersOpen(false);
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilter('genres', newGenres);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.yearRange[0] !== 1900 || filters.yearRange[1] !== new Date().getFullYear()) count++;
    if (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) count++;
    if (filters.type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.favorites) count++;
    if (filters.watchProgress !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="relative w-full max-w-2xl">
        <div className={`search-glow rounded-2xl overflow-hidden ${isFocused ? 'ring-2 ring-primary/60' : ''}`}>
          <div className="relative bg-gradient-to-r from-card to-card/80 border border-border/20">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="pl-12 pr-32 bg-transparent border-0 text-foreground placeholder:text-muted-foreground 
                       focus:ring-0 focus:border-0 font-medium
                       h-14 rounded-2xl text-lg"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {/* Filters Button */}
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-10 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-6" align="end">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Filtros Avançados</h3>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Limpar tudo
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Tipo de Conteúdo
                      </Label>
                      <Select value={filters.type} onValueChange={(value: any) => updateFilter('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="movie">Filmes</SelectItem>
                          <SelectItem value="series">Séries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Genres Filter */}
                    {availableGenres.length > 0 && (
                      <div className="space-y-2">
                        <Label>Gêneros</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {availableGenres.map(genre => (
                            <div key={genre} className="flex items-center space-x-2">
                              <Checkbox
                                id={`genre-${genre}`}
                                checked={filters.genres.includes(genre)}
                                onCheckedChange={() => toggleGenre(genre)}
                              />
                              <label htmlFor={`genre-${genre}`} className="text-sm cursor-pointer">
                                {genre}
                              </label>
                            </div>
                          ))}
                        </div>
                        {filters.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {filters.genres.map(genre => (
                              <Badge key={genre} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    {/* Year Range */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ano de Lançamento: {filters.yearRange[0]} - {filters.yearRange[1]}
                      </Label>
                      <Slider
                        value={filters.yearRange}
                        onValueChange={(value: [number, number]) => updateFilter('yearRange', value)}
                        min={1900}
                        max={new Date().getFullYear()}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Rating Range */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Avaliação: {filters.ratingRange[0]} - {filters.ratingRange[1]}
                      </Label>
                      <Slider
                        value={filters.ratingRange}
                        onValueChange={(value: [number, number]) => updateFilter('ratingRange', value)}
                        min={0}
                        max={10}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <Separator />

                    {/* Watch Progress */}
                    <div className="space-y-2">
                      <Label>Progresso de Visualização</Label>
                      <Select 
                        value={filters.watchProgress} 
                        onValueChange={(value: any) => updateFilter('watchProgress', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="unwatched">Não assistidos</SelectItem>
                          <SelectItem value="watching">Assistindo</SelectItem>
                          <SelectItem value="completed">Concluídos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Favorites Only */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites-only"
                        checked={filters.favorites}
                        onCheckedChange={(checked) => updateFilter('favorites', checked)}
                      />
                      <Label htmlFor="favorites-only" className="cursor-pointer">
                        Apenas favoritos
                      </Label>
                    </div>

                    {/* Status Filter for Series */}
                    <div className="space-y-2">
                      <Label>Status (Séries)</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value: any) => updateFilter('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="ongoing">Em andamento</SelectItem>
                          <SelectItem value="completed">Concluídas</SelectItem>
                          <SelectItem value="cancelled">Canceladas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear Search */}
              {filters.query && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateFilter('query', '')}
                  className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFiltersCount > 0 || filters.query) && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="default" className="gap-1">
              "{filters.query}"
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('query', '')}
              />
            </Badge>
          )}
          
          {filters.genres.map(genre => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleGenre(genre)}
              />
            </Badge>
          ))}
          
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.type === 'movie' ? 'Filmes' : 'Séries'}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('type', 'all')}
              />
            </Badge>
          )}
          
          {filters.favorites && (
            <Badge variant="secondary" className="gap-1">
              Favoritos
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('favorites', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}