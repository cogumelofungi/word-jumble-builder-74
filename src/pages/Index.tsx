import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { HeroBanner } from "@/components/HeroBanner";
import { ProgramCarousel } from "@/components/ProgramCarousel";
import { SeriesCarousel } from "@/components/SeriesCarousel";
import { ProgramCard } from "@/components/ProgramCard";
import { AdvancedVideoPlayer } from "@/components/AdvancedVideoPlayer";
import { PlaylistManager } from "@/components/PlaylistManager";
import { AdvancedSearchBar, SearchFilters } from "@/components/AdvancedSearchBar";
import { EpisodesCarousel } from "@/components/EpisodesCarousel";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FilterSort } from "@/components/FilterSort";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Play, Settings, Sparkles } from "lucide-react";
import { Program, Season, Episode, getPrograms, addProgram, updateProgram, reorderPrograms, getProgramIndex, getFeaturedProgram } from "@/data/programs";

const Index = () => {
  const [programs, setPrograms] = useState<Program[]>(() => getPrograms());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("home");
  const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string } | null>(null);
  const [sortType, setSortType] = useState<'title' | 'year' | 'rating' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickId, setLastClickId] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<{ season: Season; seriesTitle: string } | null>(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    genres: [],
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    type: 'all',
    status: 'all',
    favorites: false,
    watchProgress: 'all'
  });
  const { toast } = useToast();

  // Atualizar programas quando dados mudam
  useEffect(() => {
    const handleStorageChange = () => {
      setPrograms(getPrograms());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mudanças a cada 2 segundos (para mudanças na mesma aba)
    const interval = setInterval(() => {
      const currentPrograms = getPrograms();
      if (JSON.stringify(currentPrograms) !== JSON.stringify(programs)) {
        setPrograms(currentPrograms);
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [programs]);

  // Get featured program (defined in admin panel or highest rated as fallback)
  const featuredProgram = useMemo(() => {
    if (programs.length === 0) {
      return null;
    }
    
    // Try to get the featured program from admin panel
    const adminFeatured = getFeaturedProgram();
    if (adminFeatured) {
      return adminFeatured;
    }
    
    // Fallback to highest rated program
    return programs.reduce((prev, current) => 
      prev.rating > current.rating ? prev : current
    );
  }, [programs]);

  // Filter programs based on advanced search filters
  const filteredPrograms = useMemo(() => {
    let filtered = programs;

    // Filter by search query
    if (searchFilters.query.trim()) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        program.genre.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchFilters.query.toLowerCase())
      );
    }

    // Filter by genres
    if (searchFilters.genres.length > 0) {
      filtered = filtered.filter(program => 
        searchFilters.genres.includes(program.genre)
      );
    }

    // Filter by year range
    filtered = filtered.filter(program => 
      program.year >= searchFilters.yearRange[0] && 
      program.year <= searchFilters.yearRange[1]
    );

    // Filter by rating range
    filtered = filtered.filter(program => 
      program.rating >= searchFilters.ratingRange[0] && 
      program.rating <= searchFilters.ratingRange[1]
    );

    // Filter by type
    if (searchFilters.type !== 'all') {
      filtered = filtered.filter(program => program.type === searchFilters.type);
    }

    // Filter by status (for series)
    if (searchFilters.status !== 'all') {
      filtered = filtered.filter(program => 
        program.type === 'series' ? program.status === searchFilters.status : true
      );
    }

    // Filter by favorites
    if (searchFilters.favorites) {
      filtered = filtered.filter(program => program.isFavorite);
    }

    // Filter by watch progress
    if (searchFilters.watchProgress !== 'all') {
      filtered = filtered.filter(program => {
        const progress = program.progress || 0;
        switch (searchFilters.watchProgress) {
          case 'unwatched':
            return progress === 0;
          case 'watching':
            return progress > 0 && progress < 100;
          case 'completed':
            return progress === 100;
          default:
            return true;
        }
      });
    }

    // Apply old filters for compatibility
    if (filterGenre && !searchFilters.genres.length) {
      filtered = filtered.filter(program => program.genre === filterGenre);
    }

    // Sort programs
    if (sortType) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortType) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'year':
            aValue = a.year;
            bValue = b.year;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [programs, searchFilters, filterGenre, sortType, sortDirection]);

  // Organize programs into categories
  const programsByCategory = useMemo(() => {
    const continueWatching = programs.filter(p => p.progress && p.progress > 0 && p.progress < 100);
    const myList = programs.filter(p => p.isFavorite);
    const recentlyAdded = [...programs]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 8);
    
    // Group by genre
    const byGenre = programs.reduce((acc, program) => {
      if (!acc[program.genre]) {
        acc[program.genre] = [];
      }
      acc[program.genre].push(program);
      return acc;
    }, {} as Record<string, typeof programs>);

    // Get unique genres for filter
    const genres = [...new Set(programs.map(p => p.genre))];

    return {
      continueWatching,
      myList,
      recentlyAdded,
      byGenre,
      genres
    };
  }, [programs]);

  // Sistema de seleção e drag com double click
  const handleCardClick = (id: string) => {
    const currentTime = Date.now();
    const DOUBLE_CLICK_THRESHOLD = 300; // 300ms para considerar double click

    if (isDragMode && draggedItem && id !== draggedItem) {
      // Clique em destino durante modo drag
      handleDrop(draggedItem, id);
    } else if (
      !isDragMode && 
      lastClickId === id && 
      currentTime - lastClickTime < DOUBLE_CLICK_THRESHOLD
    ) {
      // Double click detectado: ativar modo drag
      setIsDragMode(true);
      setDraggedItem(id);
      setSelectedItem(id);
      toast({
        title: "Modo reorganização ativado",
        description: "Clique em outra posição para mover o programa",
        duration: 3000,
      });
    } else if (!isDragMode) {
      // Primeiro clique: apenas visual feedback
      setLastClickTime(currentTime);
      setLastClickId(id);
    }
  };

  const handleCancelDrag = () => {
    setSelectedItem(null);
    setIsDragMode(false);
    setDraggedItem(null);
    setDraggedOver(null);
    setLastClickTime(0);
    setLastClickId(null);
    
    toast({
      title: "Reorganização cancelada",
      description: "Modo de reorganização desativado",
    });
  };

  const handleDragStart = (id: string) => {
    // Não usado mais - mantido para compatibilidade
  };

  const handleDragEnd = () => {
    // Reset apenas visual states
    setDraggedOver(null);
  };

  const handleDragOver = (id: string) => {
    if (isDragMode) {
      setDraggedOver(id === 'end' ? 'end' : id);
    }
  };

  const handleDrop = (draggedId: string, targetId: string) => {
    const fromIndex = getProgramIndex(draggedId);
    
    if (fromIndex === -1) return;
    
    let toIndex: number;
    
    if (targetId === 'end') {
      // Mover para o final
      toIndex = programs.length - 1;
    } else {
      toIndex = getProgramIndex(targetId);
      if (toIndex === -1) return;
    }
    
    if (fromIndex !== toIndex) {
      // Capturar informações antes da reorganização
      const draggedProgram = programs[fromIndex];
      const targetProgram = targetId === 'end' ? null : programs[toIndex];
      
      // Executar a reorganização
      reorderPrograms(fromIndex, toIndex);
      
      // Atualizar o estado com os novos dados
      const updatedPrograms = getPrograms();
      setPrograms(updatedPrograms);
      
      const targetText = targetId === 'end' ? 'final da lista' : `posição de ${targetProgram?.title}`;
      
      toast({
        title: "Programa reorganizado com sucesso",
        description: `"${draggedProgram.title}" foi movido para ${targetText}`,
      });
      
      console.log('Reordenação executada:', {
        draggedId,
        targetId,
        fromIndex,
        toIndex,
        draggedProgram: draggedProgram.title,
        updatedLength: updatedPrograms.length
      });
    }
    
    // Reset all states
    setSelectedItem(null);
    setIsDragMode(false);
    setDraggedItem(null);
    setDraggedOver(null);
    setLastClickTime(0);
    setLastClickId(null);
  };

  const handleToggleFavorite = (id: string) => {
    const program = programs.find(p => p.id === id);
    if (program) {
      updateProgram(id, { isFavorite: !program.isFavorite });
      setPrograms(getPrograms());
      
      toast({
        title: program.isFavorite ? "Removido da Minha Lista" : "Adicionado à Minha Lista",
        description: `${program.title} ${program.isFavorite ? 'removido da' : 'adicionado à'} sua lista`,
      });
    }
  };

  const handlePlay = (id: string) => {
    const program = programs.find(p => p.id === id);
    if (!program) return;
    
    // Se for uma série, não tenta reproduzir diretamente
    if (program.type === 'series') {
      toast({
        title: "Selecione uma temporada",
        description: "Para assistir uma série, clique em uma temporada específica",
        variant: "destructive"
      });
      return;
    }
    
    // Se for um filme, reproduz normalmente
    if (program.link) {
      setCurrentVideo({ url: program.link, title: program.title });
    } else {
      toast({
        title: "Link não disponível",
        description: "Este programa não possui um link de reprodução configurado",
        variant: "destructive"
      });
    }
  };

  const handlePlaySeason = (seasonId: string, seriesId: string) => {
    // Se estiver na home, redirecionar para a aba séries
    if (activeCategory === 'home') {
      setActiveCategory('series');
      // Pequeno delay para garantir que a mudança de categoria aconteça primeiro
      setTimeout(() => {
        const series = programs.find(p => p.id === seriesId);
        if (!series || !series.seasons) return;
        
        const season = series.seasons.find(s => s.id === seasonId);
        if (!season) return;
        
        setSelectedSeason({ season, seriesTitle: series.title });
      }, 100);
    } else {
      // Se já estiver na aba séries, comportamento normal
      const series = programs.find(p => p.id === seriesId);
      if (!series || !series.seasons) return;
      
      const season = series.seasons.find(s => s.id === seasonId);
      if (!season) return;
      
      setSelectedSeason({ season, seriesTitle: series.title });
    }
  };

  const handlePlayEpisode = (episode: Episode) => {
    const videoUrl = episode.videoUrl || episode.link;
    if (videoUrl) {
      setCurrentVideo({ url: videoUrl, title: episode.title });
      setSelectedSeason(null); // Fechar a lista de episódios
    } else {
      toast({
        title: "Link não disponível",
        description: "Este episódio não possui um link de reprodução configurado",
        variant: "destructive"
      });
    }
  };

  const handleClosePlayer = () => {
    setCurrentVideo(null);
  };

  const handleVideoProgress = (progress: number) => {
    // You can implement progress tracking here if needed
    console.log('Video progress:', progress);
  };

  const handleAddProgram = (newProgram: any) => {
    addProgram(newProgram);
    setPrograms(getPrograms());
    toast({
      title: "Programa adicionado",
      description: `${newProgram.title} foi adicionado à sua coleção`,
    });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Breadcrumb navigation
  const getBreadcrumbItems = () => {
    const categoryNames = {
      home: 'Início',
      series: 'Séries',
      movies: 'Filmes', 
      favorites: 'Minha Lista',
      recent: 'Adicionados Recentemente'
    };
    
    const items = [];
    if (activeCategory !== 'home') {
      items.push({ 
        label: categoryNames[activeCategory as keyof typeof categoryNames] || activeCategory,
        isActive: true 
      });
    }
    
    return items;
  };

  const handleSort = (type: 'title' | 'year' | 'rating', direction: 'asc' | 'desc') => {
    setSortType(type);
    setSortDirection(direction);
  };

  const handleFilter = (genre?: string) => {
    setFilterGenre(genre || null);
  };

  // Handle advanced search
  const handleAdvancedSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSearchQuery(filters.query); // Keep backward compatibility
  };

  // Determine what to show based on active category and search
  const getDisplayPrograms = () => {
    if (searchFilters.query.trim() || 
        searchFilters.genres.length > 0 || 
        searchFilters.favorites ||
        searchFilters.type !== 'all' ||
        searchFilters.status !== 'all' ||
        searchFilters.watchProgress !== 'all') {
      return filteredPrograms;
    }

    switch (activeCategory) {
      case 'favorites':
        return programsByCategory.myList;
      case 'recent':
        return programsByCategory.recentlyAdded;
      case 'series':
        return programs.filter(p => p.type === 'series');
      case 'movies':
        return programs.filter(p => p.type === 'movie');
      case 'playlists':
        return []; // Will be handled by PlaylistManager
      default:
        return filteredPrograms;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        onSearch={setSearchQuery}
        onCategoryChange={handleCategoryChange}
        activeCategory={activeCategory}
        onAddProgram={handleAddProgram}
        onOpenPlaylists={() => setShowPlaylists(true)}
      />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Banner - only show on home and when not searching and has programs */}
        {activeCategory === 'home' && !searchFilters.query.trim() && programs.length > 0 && featuredProgram && (
          <HeroBanner
            featuredProgram={featuredProgram}
            onPlay={handlePlay}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Content Sections */}
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Breadcrumb Navigation */}
          {getBreadcrumbItems().length > 0 && (
            <Breadcrumb 
              items={getBreadcrumbItems()} 
              onNavigate={handleCategoryChange}
            />
          )}
          {showPlaylists ? (
            /* Playlist Manager */
            <div className="fade-in">
              <PlaylistManager
                programs={programs}
                onPlayProgram={handlePlay}
              />
              <Button
                variant="outline"
                onClick={() => setShowPlaylists(false)}
                className="mt-6"
              >
                Voltar
              </Button>
            </div>
          ) : programs.length === 0 && !searchFilters.query.trim() ? (
            /* Empty State */
            <div className="empty-state">
              <div className="empty-state-icon">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Nenhum programa cadastrado</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Comece adicionando programas à sua coleção ou acesse o painel administrativo para gerenciar seu conteúdo.
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="btn-primary hover-scale" onClick={() => window.location.href = '/painel'}>
                  <Settings className="w-4 h-4 mr-2" />
                  Ir para o Painel
                </Button>
              </div>
            </div>
          ) : searchFilters.query.trim() || 
                searchFilters.genres.length > 0 || 
                searchFilters.favorites ||
                searchFilters.type !== 'all' ||
                searchFilters.status !== 'all' ||
                searchFilters.watchProgress !== 'all' ? (
            /* Advanced Search Results */
            <div className="fade-in space-y-6">
              <AdvancedSearchBar
                onSearch={handleAdvancedSearch}
                availableGenres={programsByCategory.genres}
                placeholder="Busque por título, gênero ou descrição..."
              />
              
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  {searchFilters.query ? `Resultados para "${searchFilters.query}"` : 'Resultados filtrados'}
                </h2>
                {getDisplayPrograms().length > 0 && (
                  <FilterSort
                    onSort={handleSort}
                    onFilter={handleFilter}
                    genres={programsByCategory.genres}
                    activeSort={sortType ? { type: sortType, direction: sortDirection } : undefined}
                  />
                )}
              </div>
              {getDisplayPrograms().length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                  {getDisplayPrograms().map((program, index) => (
                    <div 
                      key={program.id} 
                      className="stagger-animation fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProgramCard
                        program={program}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlay}
                        onCardClick={handleCardClick}
                        selectedItem={selectedItem}
                        isDragMode={isDragMode}
                        draggedItem={draggedItem}
                        draggedOver={draggedOver}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar sua busca ou explore outras categorias.</p>
                </div>
              )}
            </div>
          ) : (
            /* Category-based Content */
            <>
              {/* Continue Assistindo */}
              {activeCategory === 'home' && programsByCategory.continueWatching.length > 0 && (
                <>
                  {/* Filmes em Continue Assistindo */}
                  {programsByCategory.continueWatching.filter(p => p.type === 'movie').length > 0 && (
                    <ProgramCarousel
                      title="Continue Assistindo - Filmes"
                      programs={programsByCategory.continueWatching.filter(p => p.type === 'movie')}
                      onToggleFavorite={handleToggleFavorite}
                      onPlay={handlePlay}
                      showProgress={true}
                      onCardClick={handleCardClick}
                      selectedItem={selectedItem}
                      isDragMode={isDragMode}
                      draggedItem={draggedItem}
                      draggedOver={draggedOver}
                      onCancelDrag={handleCancelDrag}
                    />
                  )}
                  
                  {/* Séries em Continue Assistindo - mostrar temporadas */}
                  {programsByCategory.continueWatching
                    .filter(p => p.type === 'series')
                    .map((seriesProgram) => (
                      <SeriesCarousel
                        key={seriesProgram.id}
                        title={`Continue Assistindo - ${seriesProgram.title}`}
                        series={seriesProgram}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlaySeason}
                      />
                    ))}
                </>
              )}

              {/* Minha Lista */}
              {(activeCategory === 'home' || activeCategory === 'favorites') && programsByCategory.myList.length > 0 && (
                <>
                  {/* Filmes em Minha Lista */}
                  {programsByCategory.myList.filter(p => p.type === 'movie').length > 0 && (
                    <ProgramCarousel
                      title="Minha Lista - Filmes"
                      programs={programsByCategory.myList.filter(p => p.type === 'movie')}
                      onToggleFavorite={handleToggleFavorite}
                      onPlay={handlePlay}
                      onCardClick={handleCardClick}
                      selectedItem={selectedItem}
                      isDragMode={isDragMode}
                      draggedItem={draggedItem}
                      draggedOver={draggedOver}
                      onCancelDrag={handleCancelDrag}
                    />
                  )}
                  
                  {/* Séries em Minha Lista - mostrar temporadas */}
                  {programsByCategory.myList
                    .filter(p => p.type === 'series')
                    .map((seriesProgram) => (
                      <SeriesCarousel
                        key={seriesProgram.id}
                        title={`Minha Lista - ${seriesProgram.title}`}
                        series={seriesProgram}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlaySeason}
                      />
                    ))}
                </>
              )}

              {/* Adicionados Recentemente */}
              {(activeCategory === 'home' || activeCategory === 'recent') && (
                <>
                  {/* Filmes Adicionados Recentemente */}
                  {programsByCategory.recentlyAdded.filter(p => p.type === 'movie').length > 0 && (
                    <ProgramCarousel
                      title="Adicionados Recentemente - Filmes"
                      programs={programsByCategory.recentlyAdded.filter(p => p.type === 'movie')}
                      onToggleFavorite={handleToggleFavorite}
                      onPlay={handlePlay}
                    />
                  )}
                  
                  {/* Séries Adicionadas Recentemente - mostrar temporadas */}
                  {programsByCategory.recentlyAdded
                    .filter(p => p.type === 'series')
                    .map((seriesProgram) => (
                      <SeriesCarousel
                        key={seriesProgram.id}
                        title={`Adicionado Recentemente - ${seriesProgram.title}`}
                        series={seriesProgram}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlaySeason}
                      />
                    ))}
                </>
              )}

              {/* Genre Carousels */}
              {activeCategory === 'home' && Object.entries(programsByCategory.byGenre).map(([genre, genrePrograms]) => {
                // Separar filmes e séries
                const movies = genrePrograms.filter(p => p.type === 'movie');
                const series = genrePrograms.filter(p => p.type === 'series');
                
                return (
                  <div key={genre}>
                    {/* Filmes do gênero */}
                    {movies.length > 0 && (
                      <ProgramCarousel
                        title={`${genre} - Filmes`}
                        programs={movies}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlay}
                        onCardClick={handleCardClick}
                        selectedItem={selectedItem}
                        isDragMode={isDragMode}
                        draggedItem={draggedItem}
                        draggedOver={draggedOver}
                        onCancelDrag={handleCancelDrag}
                      />
                    )}
                    
                    {/* Séries do gênero - mostrar temporadas */}
                    {series.map((seriesProgram) => (
                      <SeriesCarousel
                        key={seriesProgram.id}
                        title={seriesProgram.title}
                        series={seriesProgram}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlaySeason}
                      />
                    ))}
                  </div>
                );
              })}

              {/* Conteúdo específico da categoria */}
              {activeCategory === 'series' && (
                <>
                  {programs
                    .filter((p) => p.type === 'series')
                    .map((series) => (
                      <SeriesCarousel
                        key={series.id}
                        title={series.title}
                        series={series}
                        onToggleFavorite={handleToggleFavorite}
                        onPlay={handlePlaySeason}
                      />
                    ))}
                </>
              )}

              {activeCategory === 'movies' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="section-title">Filmes</h2>
                    <FilterSort
                      onSort={handleSort}
                      onFilter={handleFilter}
                      genres={programsByCategory.genres}
                      activeSort={sortType ? { type: sortType, direction: sortDirection } : undefined}
                    />
                  </div>
                  {/* Organizar filmes por gênero */}
                  {filterGenre ? (
                    /* Se há filtro de gênero, mostrar em grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                      {getDisplayPrograms().map((program, index) => (
                        <div 
                          key={program.id} 
                          className="stagger-animation fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                        <ProgramCard
                          program={program}
                          onToggleFavorite={handleToggleFavorite}
                          onPlay={handlePlay}
                          onCardClick={handleCardClick}
                          selectedItem={selectedItem}
                          isDragMode={isDragMode}
                          draggedItem={draggedItem}
                          draggedOver={draggedOver}
                        />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Mostrar filmes organizados por gênero em carousels */
                    <>
                      {Object.entries(programsByCategory.byGenre)
                        .filter(([genre, genrePrograms]) => 
                          genrePrograms.some(p => p.type === 'movie')
                        )
                        .map(([genre, genrePrograms]) => {
                          const movies = genrePrograms.filter(p => p.type === 'movie');
                          return (
                            <ProgramCarousel
                              key={genre}
                              title={`${genre} - Filmes`}
                              programs={movies}
                              onToggleFavorite={handleToggleFavorite}
                              onPlay={handlePlay}
                              onCardClick={handleCardClick}
                              selectedItem={selectedItem}
                              isDragMode={isDragMode}
                              draggedItem={draggedItem}
                              draggedOver={draggedOver}
                              onCancelDrag={handleCancelDrag}
                            />
                          );
                        })}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Advanced Video Player Modal */}
      {currentVideo && (
        <AdvancedVideoPlayer
          isOpen={!!currentVideo}
          onClose={handleClosePlayer}
          videoUrl={currentVideo.url}
          title={currentVideo.title}
          onProgress={handleVideoProgress}
        />
      )}

      {/* Episodes Carousel */}
      {selectedSeason && (
        <div className="mt-8 px-4 sm:px-6 lg:px-8">
          <EpisodesCarousel
            season={selectedSeason.season}
            seriesTitle={selectedSeason.seriesTitle}
            onPlayEpisode={handlePlayEpisode}
          />
        </div>
      )}
    </div>
  );
};

export default Index;