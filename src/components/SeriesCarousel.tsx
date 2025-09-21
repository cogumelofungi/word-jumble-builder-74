import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeasonCard } from "./SeasonCard";
import { Program } from "@/data/programs";

interface SeriesCarouselProps {
  title: string;
  series: Program;
  onToggleFavorite: (id: string) => void;
  onPlay: (seasonId: string, seriesId: string) => void;
}

export function SeriesCarousel({ 
  title, 
  series, 
  onToggleFavorite, 
  onPlay 
}: SeriesCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.getBoundingClientRect().left;
    scrollStart.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.getBoundingClientRect().left;
    const walk = x - startX.current;
    containerRef.current.scrollLeft = scrollStart.current - walk;
  };

  const endMouseDrag = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX - containerRef.current.getBoundingClientRect().left;
    scrollStart.current = containerRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.getBoundingClientRect().left;
    const walk = x - startX.current;
    containerRef.current.scrollLeft = scrollStart.current - walk;
  };

  const endTouchDrag = () => {
    isDragging.current = false;
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

  const seasons = series.seasons || [];
  
  if (seasons.length === 0) return null;

  return (
    <div className="carousel-container group mb-8">
      <h2 className="section-title">{title}</h2>
      
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

        {/* Seasons Container */}
        <div
          ref={containerRef}
          className="flex gap-3 overflow-x-auto overflow-y-visible scrollbar-none pb-4 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endMouseDrag}
          onMouseLeave={endMouseDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={endTouchDrag}
        >
          {seasons
            .sort((a, b) => a.seasonNumber - b.seasonNumber)
            .map((season) => (
              <div key={season.id} className="flex-none w-36 sm:w-40 md:w-44">
                <SeasonCard
                  season={season}
                  seriesTitle={series.title}
                  seriesId={series.id}
                  isFavorite={series.isFavorite}
                  onToggleFavorite={onToggleFavorite}
                  onPlay={() => onPlay(season.id, series.id)}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}