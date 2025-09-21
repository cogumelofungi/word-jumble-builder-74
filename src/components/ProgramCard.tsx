import { useState } from "react";
import { Play, Heart, Star, Calendar, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { DragIndicator } from "@/components/DragIndicator";

interface Program {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre: string;
  year: number;
  isFavorite: boolean;
  description?: string;
  category?: string;
}

interface ProgramCardProps {
  program: Program;
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
  compact?: boolean;
  onCardClick?: (id: string) => void;
  selectedItem?: string | null;
  isDragMode?: boolean;
  draggedItem?: string | null;
  draggedOver?: string | null;
}

export function ProgramCard({ 
  program, 
  onToggleFavorite, 
  onPlay, 
  compact = true,
  onCardClick,
  selectedItem,
  isDragMode = false,
  draggedItem,
  draggedOver
}: ProgramCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSeries = program.category === "Série";
  
  // Estados derivados
  const isSelected = selectedItem === program.id;
  const isDragged = draggedItem === program.id;
  const isDropTarget = draggedOver === program.id && isDragMode && !isDragged;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCardClick) {
      onCardClick(program.id);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragMode) {
      onPlay(program.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragMode) {
      onToggleFavorite(program.id);
    }
  };

  return (
    <TooltipProvider>
      <div 
        className={`cursor-pointer w-full aspect-[2/3] max-h-64 group p-1 transition-all duration-300 ${
          isDragged ? 'opacity-50 scale-90 rotate-1 z-50' : 'opacity-100 scale-100'
        } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' : ''} ${
          isDropTarget ? 'ring-2 ring-accent ring-offset-2 ring-offset-background animate-pulse' : ''
        }`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isDragMode) {
              handleCardClick(e as any);
            } else {
              onPlay(program.id);
            }
          }
        }}
        aria-label={
          isDragMode
            ? (isDragged ? `Movendo: ${program.title}` : `Destino para mover: ${program.title}`)
            : `Abrir ${program.title}`
        }
      >
        {/* Poster Image */}
        <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
          <ImageWithSkeleton
            src={program.poster}
            alt={`Poster de ${program.title}`}
            className="w-full h-full object-cover"
          />
        
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-300 ${
            isHovered && !isDragMode ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Content overlay - apenas quando não está em modo drag */}
          {!isDragMode && (
            <div className={`absolute inset-0 flex flex-col justify-between p-3 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              {/* Top - Favorite button */}
              <div className="flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
                      onClick={handleFavoriteClick}
                      aria-label={program.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-all duration-200 ${
                          program.isFavorite 
                            ? 'fill-red-500 text-red-500 scale-110' 
                            : 'hover:text-red-400'
                        }`} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {program.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Bottom - Info and actions */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1 drop-shadow-sm">
                    {program.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{program.year}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{program.rating}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="default"
                  size="sm"
                  className="w-full h-8 text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={handlePlayClick}
                >
                  <Play className="w-3 h-3 mr-1 fill-black" />
                  Assistir
                </Button>
              </div>
            </div>
          )}

          {/* Series badge */}
          {isSeries && (
            <div className="absolute top-2 left-2 z-10">
              <Badge 
                variant="secondary" 
                className="bg-primary/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 border border-primary/20 shadow-lg"
              >
                SÉRIE
              </Badge>
            </div>
          )}

          {/* Hover border effect */}
          <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
            isHovered && !isDragMode && !isSelected
              ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]' 
              : 'border-transparent'
          }`} />

          {/* Drop zone indicator */}
          {isDropTarget && (
            <>
              <div className="absolute inset-0 rounded-lg bg-accent/10 border-2 border-accent border-dashed pointer-events-none drop-zone-active" />
              <DragIndicator isActive={true} message="Soltar aqui" position="center" />
            </>
          )}

          {/* Selection indicator */}
          {isSelected && !isDragMode && (
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                Selecionado
              </div>
            </div>
          )}

          {/* Drag mode indicator */}
          {isDragMode && isDragged && (
            <div className="absolute inset-0 rounded-lg bg-primary/20 border-2 border-primary border-dashed pointer-events-none flex items-center justify-center">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                <Move className="w-3 h-3" />
                Sendo movido...
              </div>
            </div>
          )}
          
          {/* Shine effect on hover */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none ${
            isHovered && !isDragMode ? 'translate-x-full transition-transform duration-700' : '-translate-x-full'
          }`} />
        </div>
      </div>
    </TooltipProvider>
  );
}