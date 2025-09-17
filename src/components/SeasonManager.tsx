import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Play, Clock } from "lucide-react";
import { Season, Episode } from "@/data/programs";

interface SeasonManagerProps {
  seasons: Season[];
  onSeasonsUpdate: (seasons: Season[]) => void;
  seriesTitle: string;
}

export function SeasonManager({ seasons, onSeasonsUpdate, seriesTitle }: SeasonManagerProps) {
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
  const [isEpisodeDialogOpen, setIsEpisodeDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  
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
                    <div className="space-y-3">
                      {season.episodes.map((episode, index) => (
                        <div key={episode.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
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
                      ))}
                    </div>
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