import { useState } from "react";
import { Filter, SortAsc, SortDesc, Calendar, Star, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface FilterSortProps {
  onSort: (type: 'title' | 'year' | 'rating', direction: 'asc' | 'desc') => void;
  onFilter: (genre?: string, year?: number) => void;
  genres: string[];
  activeSort?: { type: string; direction: 'asc' | 'desc' };
}

export function FilterSort({ onSort, onFilter, genres, activeSort }: FilterSortProps) {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (type: 'title' | 'year' | 'rating') => {
    const newDirection = activeSort?.type === type && activeSort?.direction === 'desc' ? 'asc' : 'desc';
    setSortDirection(newDirection);
    onSort(type, newDirection);
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            Ordenar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSort('title')} className="gap-2">
            <Type className="w-4 h-4" />
            Título
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('year')} className="gap-2">
            <Calendar className="w-4 h-4" />
            Ano
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('rating')} className="gap-2">
            <Star className="w-4 h-4" />
            Avaliação
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filtrar por gênero</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onFilter()}>
            Todos os gêneros
          </DropdownMenuItem>
          {genres.map((genre) => (
            <DropdownMenuItem key={genre} onClick={() => onFilter(genre)}>
              {genre}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}