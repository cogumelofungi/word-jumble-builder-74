import { useState } from "react";
import { Play, Calendar, Clock, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Season, Episode } from "@/data/programs";

interface EpisodesListProps {
  isOpen: boolean;
  onClose: () => void;
  season: Season;
  seriesTitle: string;
  onPlayEpisode: (episode: Episode) => void;
}

export function EpisodesList({ 
  isOpen, 
  onClose, 
  season, 
  seriesTitle, 
  onPlayEpisode 
}: EpisodesListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const handleEpisodeClick = (episode: Episode) => {
    if (episode.videoUrl || episode.link) {
      onPlayEpisode(episode);
    } else {
      setSelectedEpisode(episode);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Duração não informada";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold">
                {seriesTitle}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary text-white">
                  Temporada {season.seasonNumber}
                </Badge>
                <span className="text-muted-foreground">
                  {season.episodes?.length || 0} episódios
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{season.year}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {season.description && (
            <p className="text-muted-foreground text-sm mt-2">
              {season.description}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-3">
            {season.episodes && season.episodes.length > 0 ? (
              season.episodes.map((episode, index) => (
                <div
                  key={episode.id}
                  className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleEpisodeClick(episode)}
                >
                  {/* Episode Number */}
                  <div className="flex-none w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {episode.title}
                        </h3>
                        {episode.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {episode.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {episode.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(episode.duration)}</span>
                            </div>
                          )}
                          {episode.airDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(episode.airDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                          {episode.watched && (
                            <Badge variant="secondary" className="text-xs">
                              Assistido
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Play Button */}
                      <div className="flex-none">
                        <Button
                          variant={episode.videoUrl || episode.link ? "default" : "secondary"}
                          size="sm"
                          className="group-hover:scale-105 transition-transform"
                          disabled={!episode.videoUrl && !episode.link}
                        >
                          <Play className="w-3 h-3 mr-1 fill-current" />
                          {episode.videoUrl || episode.link ? "Assistir" : "Indisponível"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum episódio cadastrado</h3>
                  <p className="text-sm">
                    Esta temporada ainda não possui episódios cadastrados.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}