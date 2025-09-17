import { Play, Info, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

interface Program {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre: string;
  year: number;
  isFavorite: boolean;
  description?: string;
}

interface HeroBannerProps {
  featuredProgram: Program | null;
  onPlay: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function HeroBanner({ featuredProgram, onPlay, onToggleFavorite }: HeroBannerProps) {
  // Early return with defensive checks
  if (!featuredProgram || typeof featuredProgram !== 'object') {
    return null;
  }

  return (
    <div className="relative h-[60vh] md:h-[70vh] hero-banner overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithSkeleton
          src={featuredProgram.poster || "/placeholder.svg"}
          alt={`Poster de ${featuredProgram.title || "Programa"}`}
          className="w-full h-full object-cover scale-110 transition-transform duration-[10s] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Em Destaque
              </Badge>
              <Badge variant="outline" className="border-border/50">
                {featuredProgram.genre || "Desconhecido"}
              </Badge>
              <Badge variant="outline" className="border-border/50">
                {featuredProgram.year || "N/A"}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {featuredProgram.title || "Sem Título"}
            </h1>

            {/* Description */}
            {featuredProgram.description && (
              <p className="text-lg text-white/90 mb-6 leading-relaxed max-w-xl">
                {featuredProgram.description}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">{featuredProgram.rating || "N/A"}</span>
              </div>
              <span className="text-white/70 text-sm">IMDb</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                size="lg"
                className="btn-primary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => featuredProgram.id && onPlay(featuredProgram.id)}
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                Assistir Agora
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white transition-all duration-300"
              >
                <Info className="w-5 h-5 mr-2" />
                Mais Informações
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => featuredProgram.id && onToggleFavorite(featuredProgram.id)}
                className="text-white hover:bg-white/20 border border-white/30 transition-all duration-300 hover:scale-105"
                aria-label={featuredProgram.isFavorite ? "Remover da lista" : "Adicionar à lista"}
              >
                <Plus className={`w-5 h-5 transition-transform duration-300 ${featuredProgram.isFavorite ? 'rotate-45 text-primary' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}