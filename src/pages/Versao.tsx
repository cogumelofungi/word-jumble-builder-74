import { useState, useEffect } from "react";
import { Search, Grid, List, Play, Star, Clock, Calendar, Heart, Home, Settings } from "lucide-react";
import { getPrograms, Program } from "@/data/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useToast } from "@/hooks/use-toast";

const Versao = () => {
  const [programs, setPrograms] = useState(() => getPrograms());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPrograms(getPrograms());
  }, []);

  const genres = [...new Set(programs.map(p => p.genre))];

  const filteredPrograms = programs
    .filter(program => 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === "" || program.genre === selectedGenre)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "year": return b.year - a.year;
        case "title": return a.title.localeCompare(b.title);
        default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  const handlePlay = (program: Program) => {
    if (program.link) {
      setCurrentVideo({ url: program.link, title: program.title });
    } else if (program.videoUrl) {
      setCurrentVideo({ url: program.videoUrl, title: program.title });
    } else {
      toast({
        title: "Link não disponível",
        description: "Este programa não possui um link de reprodução configurado",
        variant: "destructive"
      });
    }
  };

  const handleClosePlayer = () => {
    setCurrentVideo(null);
  };

  const handleVideoProgress = (progress: number) => {
    console.log('Video progress:', progress);
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      {/* Header */}
      <div className="bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                    <Home className="w-5 h-5" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-light tracking-tight">StreamVault</h1>
              </div>
              <div className="h-6 w-px bg-white/20"></div>
              <span className="text-white/60 text-sm font-light">
                {programs.length} programa{programs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/painel">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Painel
                </Button>
              </Link>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-full w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-full w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Buscar programas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 rounded-full h-12 focus:bg-white/10 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-full text-sm focus:border-white/30 outline-none hover:bg-white/10 transition-all appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">Todos os gêneros</option>
                {genres.map(genre => (
                  <option key={genre} value={genre} className="bg-black">{genre}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-full text-sm focus:border-white/30 outline-none hover:bg-white/10 transition-all appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="recent" className="bg-black">Mais recentes</option>
                <option value="rating" className="bg-black">Melhor avaliados</option>
                <option value="year" className="bg-black">Por ano</option>
                <option value="title" className="bg-black">Por título</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-white/30 text-xl font-light mb-3">
              Nenhum programa encontrado
            </div>
            <div className="text-white/20 text-sm font-light">
              Importe um arquivo JSON no painel administrativo
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid" ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8" : 
            "space-y-6"
          }>
            {filteredPrograms.map((program) => (
              <div key={program.id} className="group">
                {viewMode === "grid" ? (
                  // Grid View - Modern Cards
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50">
                    <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-white/10 to-black/20">
                      {program.poster ? (
                        <img 
                          src={program.poster} 
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-black/20">
                          <Play className="w-16 h-16 text-white/20" />
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Button 
                          className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 p-0 transform scale-75 group-hover:scale-100 transition-transform duration-300"
                          onClick={() => handlePlay(program)}
                        >
                          <Play className="w-6 h-6 ml-1 fill-white" />
                        </Button>
                      </div>
                      
                      {/* Favorite indicator */}
                      {program.isFavorite && (
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Heart className="w-4 h-4 fill-white text-white" />
                        </div>
                      )}
                      
                      {/* Rating badge */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-white text-xs font-medium">{program.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card content */}
                    <div className="p-6">
                      <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-white/90 transition-colors">
                        {program.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/60 text-sm font-light">{program.year}</span>
                        <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 rounded-full text-xs font-light hover:bg-white/20">
                          {program.genre}
                        </Badge>
                      </div>
                      
                      {/* Progress bar */}
                      {program.progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/50 text-xs font-light">Progresso</span>
                            <span className="text-white/60 text-xs font-medium">{program.progress}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-white to-white/80 h-full rounded-full transition-all duration-500"
                              style={{ width: `${program.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View - Clean rows
                  <div className="group p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300">
                    <div className="flex items-center space-x-6">
                      {/* Poster thumbnail */}
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-black/20 flex-shrink-0">
                        {program.poster ? (
                          <img 
                            src={program.poster} 
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/30" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-white mb-1 group-hover:text-white/90 transition-colors">
                              {program.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-white/60">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                {program.year}
                              </span>
                              <span className="flex items-center">
                                <Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                                {program.rating}
                              </span>
                              {program.isFavorite && (
                                <span className="flex items-center">
                                  <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2 h-auto"
                            onClick={() => handlePlay(program)}
                          >
                            <Play className="w-4 h-4 mr-2 fill-white" />
                            Assistir
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 rounded-full font-light">
                            {program.genre}
                          </Badge>
                          
                          {program.progress && (
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center text-sm text-white/60">
                                <Clock className="w-4 h-4 mr-1.5" />
                                {program.progress}% concluído
                              </div>
                              <div className="w-24 bg-white/10 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-white to-white/80 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${program.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 bg-gradient-to-t from-black to-transparent mt-24">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center text-white/30 text-sm font-light">
            Versão © {new Date().getFullYear()} · {programs.length} programa{programs.length !== 1 ? 's' : ''} disponível{programs.length !== 1 ? 'eis' : ''}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayer
          isOpen={!!currentVideo}
          onClose={handleClosePlayer}
          videoUrl={currentVideo.url}
          title={currentVideo.title}
          onProgress={handleVideoProgress}
        />
      )}
    </div>
  );
};

export default Versao;