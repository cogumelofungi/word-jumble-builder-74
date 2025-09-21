import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Edit, Trash2, Play, Clock, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Season, Episode } from "@/data/programs";

interface SeasonManagerProps {
  seasons: Season[];
  onSeasonsUpdate: (seasons: Season[]) => void;
  seriesTitle: string;
}

export function SeasonManager({ seasons, onSeasonsUpdate, seriesTitle }: SeasonManagerProps) {
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
  const [isEpisodeDialogOpen, setIsEpisodeDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<{[seasonId: string]: number}>({});
  
  const EPISODES_PER_PAGE = 10;
  
  const [seasonForm, setSeasonForm] = useState({
    seasonNumber: 1,
    title: "",
    description: "",
    poster: "",
    year: new Date().getFullYear()
  });

  const [episodeForm, setEpisodeForm] = useState({
    title: "",
    description: "",
    duration: 45,
    videoUrl: "",
    link: "",
    airDate: ""
  });

  const [bulkForm, setBulkForm] = useState({
    baseTitle: "",
    startEpisode: 1,
    endEpisode: 1,
    duration: 45,
    airDate: "",
    description: "",
    links: ""
  });

  const resetSeasonForm = () => {
    setSeasonForm({
      seasonNumber: seasons.length + 1,
      title: "",
      description: "",
      poster: "",
      year: new Date().getFullYear()
    });
    setEditingSeason(null);
  };

  const resetEpisodeForm = () => {
    setEpisodeForm({
      title: "",
      description: "",
      duration: 45,
      videoUrl: "",
      link: "",
      airDate: ""
    });
    setEditingEpisode(null);
  };

  const resetBulkForm = () => {
    setBulkForm({
      baseTitle: "",
      startEpisode: 1,
      endEpisode: 1,
      duration: 45,
      airDate: "",
      description: "",
      links: ""
    });
  };

  const handleAddSeason = () => {
    const newSeason: Season = {
      id: Date.now().toString(),
      seasonNumber: seasonForm.seasonNumber,
      title: seasonForm.title || `Temporada ${seasonForm.seasonNumber}`,
      description: seasonForm.description,
      poster: seasonForm.poster,
      year: seasonForm.year,
      episodes: []
    };

    if (editingSeason) {
      const updatedSeasons = seasons.map(s => 
        s.id === editingSeason.id ? { ...newSeason, id: editingSeason.id, episodes: editingSeason.episodes } : s
      );
      onSeasonsUpdate(updatedSeasons);
    } else {
      onSeasonsUpdate([...seasons, newSeason]);
    }

    setIsSeasonDialogOpen(false);
    resetSeasonForm();
  };

  const handleAddEpisode = () => {
    if (!selectedSeasonId) return;

    const newEpisode: Episode = {
      id: Date.now().toString(),
      title: episodeForm.title,
      description: episodeForm.description,
      duration: episodeForm.duration,
      videoUrl: episodeForm.videoUrl,
      link: episodeForm.link,
      airDate: episodeForm.airDate,
      watched: false
    };

    const updatedSeasons = seasons.map(season => {
      if (season.id === selectedSeasonId) {
        if (editingEpisode) {
          return {
            ...season,
            episodes: season.episodes.map(ep => 
              ep.id === editingEpisode.id ? { ...newEpisode, id: editingEpisode.id } : ep
            )
          };
        } else {
          return {
            ...season,
            episodes: [...season.episodes, newEpisode]
          };
        }
      }
      return season;
    });

    onSeasonsUpdate(updatedSeasons);
    setIsEpisodeDialogOpen(false);
    resetEpisodeForm();
  };

  const handleEditSeason = (season: Season) => {
    setEditingSeason(season);
    setSeasonForm({
      seasonNumber: season.seasonNumber,
      title: season.title || "",
      description: season.description || "",
      poster: season.poster || "",
      year: season.year
    });
    setIsSeasonDialogOpen(true);
  };

  const handleEditEpisode = (episode: Episode, seasonId: string) => {
    setEditingEpisode(episode);
    setSelectedSeasonId(seasonId);
    setEpisodeForm({
      title: episode.title,
      description: episode.description || "",
      duration: episode.duration || 45,
      videoUrl: episode.videoUrl || "",
      link: episode.link || "",
      airDate: episode.airDate || ""
    });
    setIsEpisodeDialogOpen(true);
  };

  const handleDeleteSeason = (seasonId: string) => {
    onSeasonsUpdate(seasons.filter(s => s.id !== seasonId));
  };

  const handleDeleteEpisode = (seasonId: string, episodeId: string) => {
    const updatedSeasons = seasons.map(season => {
      if (season.id === seasonId) {
        return {
          ...season,
          episodes: season.episodes.filter(ep => ep.id !== episodeId)
        };
      }
      return season;
    });
    onSeasonsUpdate(updatedSeasons);
  };

  const handleBulkAddEpisodes = () => {
    if (!selectedSeasonId) return;

    const links = bulkForm.links.split('\n').map(link => link.trim()).filter(link => link);
    const episodeCount = bulkForm.endEpisode - bulkForm.startEpisode + 1;
    
    if (links.length === 0) {
      // Se não há links, cria episódios sem links
      const newEpisodes: Episode[] = [];
      for (let i = 0; i < episodeCount; i++) {
        const episodeNumber = bulkForm.startEpisode + i;
        newEpisodes.push({
          id: `${Date.now()}-${i}`,
          title: bulkForm.baseTitle ? `${bulkForm.baseTitle} - Episódio ${episodeNumber}` : `Episódio ${episodeNumber}`,
          description: bulkForm.description,
          duration: bulkForm.duration,
          airDate: bulkForm.airDate,
          watched: false
        });
      }
      
      const updatedSeasons = seasons.map(season => {
        if (season.id === selectedSeasonId) {
          return {
            ...season,
            episodes: [...season.episodes, ...newEpisodes]
          };
        }
        return season;
      });
      
      onSeasonsUpdate(updatedSeasons);
    } else {
      // Se há links, cria um episódio para cada link
      const newEpisodes: Episode[] = links.map((link, index) => {
        const episodeNumber = bulkForm.startEpisode + index;
        return {
          id: `${Date.now()}-${index}`,
          title: bulkForm.baseTitle ? `${bulkForm.baseTitle} - Episódio ${episodeNumber}` : `Episódio ${episodeNumber}`,
          description: bulkForm.description,
          duration: bulkForm.duration,
          link: link,
          airDate: bulkForm.airDate,
          watched: false
        };
      });

      const updatedSeasons = seasons.map(season => {
        if (season.id === selectedSeasonId) {
          return {
            ...season,
            episodes: [...season.episodes, ...newEpisodes]
          };
        }
        return season;
      });

      onSeasonsUpdate(updatedSeasons);
    }

    setIsBulkDialogOpen(false);
    resetBulkForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gerenciar Temporadas - {seriesTitle}</h3>
        <Dialog open={isSeasonDialogOpen} onOpenChange={setIsSeasonDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetSeasonForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Temporada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingSeason ? 'Editar Temporada' : 'Nova Temporada'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seasonNumber">Número da Temporada</Label>
                  <Input
                    id="seasonNumber"
                    type="number"
                    value={seasonForm.seasonNumber}
                    onChange={(e) => setSeasonForm(prev => ({ ...prev, seasonNumber: parseInt(e.target.value) || 1 }))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="seasonYear">Ano</Label>
                  <Input
                    id="seasonYear"
                    type="number"
                    value={seasonForm.year}
                    onChange={(e) => setSeasonForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    min="1900"
                    max="2030"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="seasonTitle">Título (opcional)</Label>
                <Input
                  id="seasonTitle"
                  value={seasonForm.title}
                  onChange={(e) => setSeasonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`Temporada ${seasonForm.seasonNumber}`}
                />
              </div>
              <div>
                <Label htmlFor="seasonDescription">Descrição</Label>
                <Textarea
                  id="seasonDescription"
                  value={seasonForm.description}
                  onChange={(e) => setSeasonForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da temporada..."
                />
              </div>
              <div>
                <Label htmlFor="seasonPoster">URL do Poster da Temporada</Label>
                <Input
                  id="seasonPoster"
                  value={seasonForm.poster}
                  onChange={(e) => setSeasonForm(prev => ({ ...prev, poster: e.target.value }))}
                  placeholder="https://exemplo.com/poster-temporada.jpg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddSeason} className="flex-1">
                  {editingSeason ? 'Atualizar' : 'Adicionar'} Temporada
                </Button>
                <Button variant="outline" onClick={() => setIsSeasonDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {seasons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma temporada cadastrada. Adicione a primeira temporada para começar.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={seasons[0]?.id} className="space-y-4">
          <TabsList className="grid w-full grid-cols-auto">
            {seasons.map((season) => (
              <TabsTrigger key={season.id} value={season.id} className="text-sm">
                {season.title || `Temporada ${season.seasonNumber}`}
              </TabsTrigger>
            ))}
          </TabsList>

          {seasons.map((season) => (
            <TabsContent key={season.id} value={season.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {season.title || `Temporada ${season.seasonNumber}`}
                        <Badge variant="outline">{season.year}</Badge>
                      </CardTitle>
                      {season.description && (
                        <CardDescription>{season.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isEpisodeDialogOpen} onOpenChange={setIsEpisodeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSeasonId(season.id);
                              resetEpisodeForm();
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Episódio
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editingEpisode ? 'Editar Episódio' : 'Novo Episódio'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="episodeTitle">Título do Episódio</Label>
                              <Input
                                id="episodeTitle"
                                value={episodeForm.title}
                                onChange={(e) => setEpisodeForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Título do episódio"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="episodeDuration">Duração (minutos)</Label>
                                <Input
                                  id="episodeDuration"
                                  type="number"
                                  value={episodeForm.duration}
                                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                                  min="1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="episodeAirDate">Data de Lançamento</Label>
                                <Input
                                  id="episodeAirDate"
                                  type="date"
                                  value={episodeForm.airDate}
                                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, airDate: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="episodeVideoUrl">URL do Vídeo</Label>
                              <Input
                                id="episodeVideoUrl"
                                value={episodeForm.videoUrl}
                                onChange={(e) => setEpisodeForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                placeholder="https://exemplo.com/episodio.mp4"
                              />
                            </div>
                            <div>
                              <Label htmlFor="episodeLink">Link Externo</Label>
                              <Input
                                id="episodeLink"
                                value={episodeForm.link}
                                onChange={(e) => setEpisodeForm(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="https://netflix.com/watch/..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="episodeDescription">Descrição</Label>
                              <Textarea
                                id="episodeDescription"
                                value={episodeForm.description}
                                onChange={(e) => setEpisodeForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Sinopse do episódio..."
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button onClick={handleAddEpisode} className="flex-1">
                                {editingEpisode ? 'Atualizar' : 'Adicionar'} Episódio
                              </Button>
                              <Button variant="outline" onClick={() => setIsEpisodeDialogOpen(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSeasonId(season.id);
                              resetBulkForm();
                            }}
                          >
                            <List className="w-4 h-4 mr-2" />
                            Em Lote
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Adicionar Episódios em Lote</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="bulkBaseTitle">Título Base (opcional)</Label>
                              <Input
                                id="bulkBaseTitle"
                                value={bulkForm.baseTitle}
                                onChange={(e) => setBulkForm(prev => ({ ...prev, baseTitle: e.target.value }))}
                                placeholder="Ex: Nome da Série"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Se preenchido, será usado como "Título Base - Episódio X"
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="bulkStartEpisode">Episódio Inicial</Label>
                                <Input
                                  id="bulkStartEpisode"
                                  type="number"
                                  value={bulkForm.startEpisode}
                                  onChange={(e) => setBulkForm(prev => ({ ...prev, startEpisode: parseInt(e.target.value) || 1 }))}
                                  min="1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="bulkEndEpisode">Episódio Final</Label>
                                <Input
                                  id="bulkEndEpisode"
                                  type="number"
                                  value={bulkForm.endEpisode}
                                  onChange={(e) => setBulkForm(prev => ({ ...prev, endEpisode: parseInt(e.target.value) || 1 }))}
                                  min={bulkForm.startEpisode}
                                />
                              </div>
                              <div>
                                <Label htmlFor="bulkDuration">Duração (min)</Label>
                                <Input
                                  id="bulkDuration"
                                  type="number"
                                  value={bulkForm.duration}
                                  onChange={(e) => setBulkForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                                  min="1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="bulkAirDate">Data de Lançamento</Label>
                                <Input
                                  id="bulkAirDate"
                                  type="date"
                                  value={bulkForm.airDate}
                                  onChange={(e) => setBulkForm(prev => ({ ...prev, airDate: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label>Total de Episódios</Label>
                                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                                  {bulkForm.endEpisode - bulkForm.startEpisode + 1} episódios
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="bulkDescription">Descrição Base (opcional)</Label>
                              <Textarea
                                id="bulkDescription"
                                value={bulkForm.description}
                                onChange={(e) => setBulkForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descrição que será aplicada a todos os episódios..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="bulkLinks">Links dos Episódios (opcional)</Label>
                              <Textarea
                                id="bulkLinks"
                                value={bulkForm.links}
                                onChange={(e) => setBulkForm(prev => ({ ...prev, links: e.target.value }))}
                                placeholder="Cole os links aqui, um por linha:&#10;https://drive.google.com/file/d/1FwRSCnQBqJ9gXfGNLrkUhtji9tBD5jmd/view&#10;https://drive.google.com/file/d/2FwRSCnQBqJ9gXfGNLrkUhtji9tBD5jmd/view&#10;..."
                                rows={6}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Deixe em branco para criar episódios sem links. Um link por linha.
                              </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button onClick={handleBulkAddEpisodes} className="flex-1">
                                Adicionar {bulkForm.links ? bulkForm.links.split('\n').filter(l => l.trim()).length : bulkForm.endEpisode - bulkForm.startEpisode + 1} Episódios
                              </Button>
                              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" variant="outline" onClick={() => handleEditSeason(season)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteSeason(season.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {season.episodes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum episódio cadastrado nesta temporada.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {(() => {
                          const page = currentPage[season.id] || 1;
                          const startIndex = (page - 1) * EPISODES_PER_PAGE;
                          const endIndex = startIndex + EPISODES_PER_PAGE;
                          const paginatedEpisodes = season.episodes.slice(startIndex, endIndex);
                          
                          return paginatedEpisodes.map((episode, index) => {
                            const actualIndex = startIndex + index + 1;
                            return (
                              <div key={episode.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                    {actualIndex}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{episode.title}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      {episode.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {episode.duration}min
                                        </span>
                                      )}
                                      {episode.airDate && (
                                        <span>{new Date(episode.airDate).toLocaleDateString('pt-BR')}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {(episode.videoUrl || episode.link) && (
                                    <Button size="sm" variant="outline">
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => handleEditEpisode(episode, season.id)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteEpisode(season.id, episode.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {season.episodes.length > EPISODES_PER_PAGE && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Mostrando {Math.min(((currentPage[season.id] || 1) - 1) * EPISODES_PER_PAGE + 1, season.episodes.length)} - {Math.min((currentPage[season.id] || 1) * EPISODES_PER_PAGE, season.episodes.length)} de {season.episodes.length} episódios
                          </div>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(prev => ({
                                    ...prev,
                                    [season.id]: Math.max(1, (prev[season.id] || 1) - 1)
                                  }))}
                                  disabled={(currentPage[season.id] || 1) <= 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Anterior
                                </Button>
                              </PaginationItem>
                              {(() => {
                                const totalPages = Math.ceil(season.episodes.length / EPISODES_PER_PAGE);
                                const current = currentPage[season.id] || 1;
                                const pages = [];
                                
                                for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
                                  pages.push(
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        onClick={() => setCurrentPage(prev => ({
                                          ...prev,
                                          [season.id]: i
                                        }))}
                                        isActive={current === i}
                                        className="cursor-pointer"
                                      >
                                        {i}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }
                                return pages;
                              })()}
                              <PaginationItem>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(prev => ({
                                    ...prev,
                                    [season.id]: Math.min(Math.ceil(season.episodes.length / EPISODES_PER_PAGE), (prev[season.id] || 1) + 1)
                                  }))}
                                  disabled={(currentPage[season.id] || 1) >= Math.ceil(season.episodes.length / EPISODES_PER_PAGE)}
                                >
                                  Próxima
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}