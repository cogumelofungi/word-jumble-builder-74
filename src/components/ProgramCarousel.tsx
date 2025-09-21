import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "./ProgramCard";
import { DragIndicator } from "./DragIndicator";

interface Program {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre: string;
  year: number;
  isFavorite: boolean;
  description?: string;
  progress?: number;
  category?: string;
}

interface ProgramCarouselProps {
  title: string;
  programs: Program[];
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
  showProgress?: boolean;
  onCardClick?: (id: string) => void;
  selectedItem?: string | null;
  isDragMode?: boolean;
  draggedItem?: string | null;
  draggedOver?: string | null;
  onCancelDrag?: () => void;
}

export function ProgramCarousel({ 
  title, 
  programs, 
  onToggleFavorite, 
  onPlay, 
  showProgress = false,
  onCardClick,
  selectedItem,
  isDragMode = false,
  draggedItem,
  draggedOver,
  onCancelDrag
}: ProgramCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll state
  const isScrolling = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const dragDistance = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || draggedItem) return; // Não permitir scroll durante drag de item
    
    isScrolling.current = true;
    startX.current = e.pageX - containerRef.current.getBoundingClientRect().left;
    scrollStart.current = containerRef.current.scrollLeft;
    dragDistance.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrolling.current || !containerRef.current || draggedItem) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.getBoundingClientRect().left;
    const walk = x - startX.current;
    dragDistance.current = Math.abs(walk);
    
    // Só fazer scroll se a distância for significativa
    if (dragDistance.current > 5) {
      containerRef.current.scrollLeft = scrollStart.current - walk;
    }
  };

  const endMouseDrag = () => {
    isScrolling.current = false;
    dragDistance.current = 0;
    
    // Adicionar um pequeno delay antes de permitir cliques novamente
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      dragDistance.current = 0;
    }, 100);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || draggedItem) return;
    
    isScrolling.current = true;
    startX.current = e.touches[0].pageX - containerRef.current.getBoundingClientRect().left;
    scrollStart.current = containerRef.current.scrollLeft;
    dragDistance.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isScrolling.current || !containerRef.current || draggedItem) return;
    
    const x = e.touches[0].pageX - containerRef.current.getBoundingClientRect().left;
    const walk = x - startX.current;
    dragDistance.current = Math.abs(walk);
    
    if (dragDistance.current > 5) {
      containerRef.current.scrollLeft = scrollStart.current - walk;
    }
  };

  const endTouchDrag = () => {
    isScrolling.current = false;
    dragDistance.current = 0;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const scrollAmount = containerRef.current.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    containerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = containerRef.current && 
    scrollPosition < (containerRef.current.scrollWidth - containerRef.current.clientWidth);

  if (programs.length === 0) return null;

  return (
    <div className="carousel-container group mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        {isDragMode && onCancelDrag && (
          <button
            onClick={onCancelDrag}
            className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            Cancelar reorganização
          </button>
        )}
      </div>
      
      <div className="relative">
        {/* Previous Button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            className="carousel-button prev"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Next Button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            className="carousel-button next"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        {/* Programs Container */}
        <div
          ref={containerRef}
          className={`flex gap-3 overflow-x-auto overflow-y-visible scrollbar-none pb-4 select-none transition-all duration-200 ${
            isDragMode 
              ? 'cursor-default bg-muted/20 rounded-lg border-2 border-dashed border-primary/30' 
              : isScrolling.current 
                ? 'cursor-grabbing' 
                : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          onMouseDown={!isDragMode ? handleMouseDown : undefined}
          onMouseMove={!isDragMode ? handleMouseMove : undefined}
          onMouseUp={!isDragMode ? endMouseDrag : undefined}
          onMouseLeave={!isDragMode ? endMouseDrag : undefined}
          onTouchStart={!isDragMode ? handleTouchStart : undefined}
          onTouchMove={!isDragMode ? handleTouchMove : undefined}
          onTouchEnd={!isDragMode ? endTouchDrag : undefined}
        >
          {programs.map((program, index) => {
            const cardWidth = "w-36 sm:w-40 md:w-44";
            
            const isSelected = selectedItem === program.id;
            const isDragged = draggedItem === program.id;
            const isDropTarget = draggedOver === program.id && isDragMode;
            
            return (
              <div 
                key={program.id} 
                className={`flex-none ${cardWidth} transition-all duration-300 ${
                  isDragged ? 'z-50' : ''
                } ${isDropTarget ? 'scale-105' : ''} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{
                  transform: isDragged ? 'translateY(-8px)' : 'translateY(0)',
                  filter: draggedItem && !isDragged ? 'brightness(0.5)' : 'brightness(1)',
                  opacity: isDragMode && !isDragged && !isDropTarget ? 0.6 : 1
                }}
              >
                <ProgramCard
                  program={program}
                  onToggleFavorite={onToggleFavorite}
                  onPlay={onPlay}
                  onCardClick={onCardClick}
                  selectedItem={selectedItem}
                  isDragMode={isDragMode}
                  draggedItem={draggedItem}
                  draggedOver={draggedOver}
                />
                {showProgress && program.progress && (
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Drop zone no final - apenas quando em modo drag */}
          {isDragMode && draggedItem && (
            <div 
              className="flex-none w-36 sm:w-40 md:w-44 aspect-[2/3] border-2 border-dashed border-primary/50 rounded-lg relative bg-primary/5 transition-all duration-200 hover:border-primary hover:bg-primary/10 drop-zone-active cursor-pointer"
              onClick={() => onCardClick && onCardClick('end')}
            >
              <DragIndicator 
                isActive={draggedOver === 'end'} 
                message="Mover para o final" 
                position="center" 
              />
              {draggedOver !== 'end' && (
                <div className="absolute inset-0 flex items-center justify-center text-primary/70 text-sm font-medium">
                  Mover para o final
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}