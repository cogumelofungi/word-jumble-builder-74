import { useState } from "react";
import { Play, Heart, Calendar, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Season } from "@/data/programs";

interface SeasonCardProps {
  season: Season;
  seriesTitle: string;
  seriesId: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
  compact?: boolean;
}

export function SeasonCard({ 
  season, 
  seriesTitle, 
  seriesId, 
  isFavorite, 
  onToggleFavorite, 
  onPlay, 
  compact = true 
}: SeasonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="cursor-pointer w-full aspect-[2/3] max-h-64"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image */}
      <div className="relative w-full h-full">
        <img
          src={season.poster || '/placeholder.svg'}
          alt={`${seriesTitle} - Temporada ${season.seasonNumber}`}
          className="w-full h-full object-cover rounded-lg"
        />
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Content overlay */}
        <div className={`absolute inset-0 flex flex-col justify-between p-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top - Favorite button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(seriesId);
              }}
            >
              <Heart 
                className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          </div>

          {/* Bottom - Info and actions */}
          <div className="space-y-2">
            <div>
              <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1 mb-1">
                Temporada {season.seasonNumber}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>{season.year}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  <span>{season.episodes?.length || 0} eps</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="default"
              size="sm"
              className="w-full h-7 text-xs font-semibold bg-white text-black hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(season.id);
              }}
            >
              <Play className="w-3 h-3 mr-1 fill-black" />
              Assistir
            </Button>
          </div>
        </div>

        {/* Season badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-primary text-white text-xs px-2 py-0.5">
            TEMP {season.seasonNumber}
          </Badge>
        </div>

        {/* Hover border effect */}
        {isHovered && (
          <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none" />
        )}
      </div>
    </div>
  );
}