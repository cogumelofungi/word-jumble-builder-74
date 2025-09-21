import { useState } from "react";
import { Play, Clock, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { Season, Episode } from "@/data/programs";

interface EpisodesCarouselProps {
  season: Season;
  seriesTitle: string;
  onPlayEpisode: (episode: Episode) => void;
}

export function EpisodesCarousel({ 
  season, 
  seriesTitle, 
  onPlayEpisode 
}: EpisodesCarouselProps) {
  const [hoveredEpisode, setHoveredEpisode] = useState<string | null>(null);

  const handleEpisodeClick = (episode: Episode) => {
    if (episode.videoUrl || episode.link) {
      onPlayEpisode(episode);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (!season.episodes || season.episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum episódio disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{seriesTitle}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-primary text-white">
              Temporada {season.seasonNumber}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {season.episodes.length} episódios
            </span>
          </div>
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {season.episodes.map((episode, index) => {
            const isHovered = hoveredEpisode === episode.id;
            const episodeNumber = index + 1;
            
            return (
              <CarouselItem key={episode.id} className="pl-2 md:pl-4 basis-auto w-36 sm:w-40 md:w-44" >
                <div 
                  className="cursor-pointer w-full aspect-[2/3] max-h-64 group p-1 transition-all duration-300"
                  onClick={() => handleEpisodeClick(episode)}
                  onMouseEnter={() => setHoveredEpisode(episode.id)}
                  onMouseLeave={() => setHoveredEpisode(null)}
                >
                  {/* Episode Image - using season poster */}
                  <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                    <ImageWithSkeleton
                      src={season.poster || "/placeholder.svg"}
                      alt={`Episódio ${episodeNumber} - ${episode.title}`}
                      className="w-full h-full object-cover"
                    />
                  
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`} />
                    
                    {/* Content overlay */}
                    <div className={`absolute inset-0 flex flex-col justify-between p-3 transition-all duration-300 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}>
                      {/* Top - Watched indicator */}
                      <div className="flex justify-end">
                        {episode.watched && (
                          <Badge variant="secondary" className="bg-green-600/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 border border-green-600/20 shadow-lg">
                            Assistido
                          </Badge>
                        )}
                      </div>

                      {/* Bottom - Info and actions */}
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1 drop-shadow-sm">
                            {episode.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-white/90">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(episode.duration)}</span>
                            </div>
                            {episode.airDate && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(episode.airDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full h-8 text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 hover:scale-105 shadow-lg"
                          disabled={!episode.videoUrl && !episode.link}
                        >
                          <Play className="w-3 h-3 mr-1 fill-black" />
                          {episode.videoUrl || episode.link ? "Assistir" : "Indisponível"}
                        </Button>
                      </div>
                    </div>

                    {/* Episode badge - red like in the original cards */}
                    <div className="absolute top-2 left-2 z-10">
                      <Badge 
                        variant="secondary" 
                        className="bg-red-600/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 border border-red-600/20 shadow-lg"
                      >
                        EP {episodeNumber}
                      </Badge>
                    </div>

                    {/* Hover border effect */}
                    <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
                      isHovered
                        ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]' 
                        : 'border-transparent'
                    }`} />
                    
                    {/* Shine effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none ${
                      isHovered ? 'translate-x-full transition-transform duration-700' : '-translate-x-full'
                    }`} />
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
}