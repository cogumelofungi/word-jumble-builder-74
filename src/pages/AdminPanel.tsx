import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Plus, Edit, Trash2, Play, ExternalLink, Home, Settings, Users, Video, Download, Upload, Star, Tv, Link2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Program, getPrograms, addProgram, updateProgram, deleteProgram, clearAllPrograms, exportPrograms, importPrograms, setFeaturedProgram, removeFeaturedProgram, getFeaturedProgram } from "@/data/programs";
import { SeasonManager } from "@/components/SeasonManager";
import { AdminProgramCard } from "@/components/AdminProgramCard";
import { AddProgramDialog } from "@/components/AddProgramDialog";
import { AdvancedVideoPlayer } from "@/components/AdvancedVideoPlayer";
import { useTVDetection } from "@/hooks/use-tv-detection";

const AdminPanel = () => {
  const [programs, setPrograms] = useState<Program[]>(() => getPrograms());
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState("programs");
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [showSeasonManager, setShowSeasonManager] = useState(false);
  const [jsonImportUrl, setJsonImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [brokenLinks, setBrokenLinks] = useState<{program: Program, link: string, type: 'main' | 'episode'}[]>([]);
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [showBrokenLinks, setShowBrokenLinks] = useState(false);
  const [exportInfo, setExportInfo] = useState<{ url: string; filename: string } | null>(null);
  const { toast } = useToast();
  const isTV = useTVDetection();

  // Sync with shared programs data
  useEffect(() => {
    setPrograms(getPrograms());
  }, []);

  useEffect(() => {
    return () => {
      if (exportInfo) {
        URL.revokeObjectURL(exportInfo.url);
      }
    };
  }, [exportInfo]);

  const handleAddProgram = (newProgram: any) => {
    addProgram(newProgram);
    setPrograms(getPrograms());
    toast({
      title: "Sucesso",
      description: "Programa adicionado com sucesso",
    });
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProgram(id);
    setPrograms(getPrograms());
    toast({
      title: "Sucesso",
      description: "Programa removido com sucesso",
    });
  };

  const handlePlayVideo = (program: Program) => {
    setCurrentProgram(program);
    
    if (program.videoUrl) {
      setCurrentVideo(program.videoUrl);
      setShowPlayerDialog(true);
      setActiveTab("player");
    } else if (program.link) {
      setCurrentVideo(program.link);
      setShowPlayerDialog(true);
      setActiveTab("player");
    } else {
      toast({
        title: "Erro",
        description: "Nenhum link de vídeo configurado",
        variant: "destructive"
      });
    }
  };

  const clearAllData = () => {
    clearAllPrograms();
    setPrograms(getPrograms());
    toast({
      title: "Sucesso",
      description: "Todos os dados foram limpos",
    });
  };

  const handleExport = () => {
    try {
      const currentPrograms = getPrograms();
      if (currentPrograms.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há programas para exportar",
          variant: "destructive"
        });
        return;
      }

      const dataStr = JSON.stringify(currentPrograms, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `streamflix-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Atualiza link manual (revoga anterior se houver)
      setExportInfo(prev => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url, filename };
      });

      // Tenta baixar automaticamente
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 0);

      toast({
        title: "Sucesso",
        description: `${currentPrograms.length} programas exportados. Se não iniciar, use o link de download manual.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importPrograms(file)
      .then((importedCount) => {
        setPrograms(getPrograms());
        toast({
          title: "Sucesso",
          description: `${importedCount} programas importados com sucesso`,
        });
      })
      .catch((error) => {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      });

    // Reset input
    event.target.value = '';
  };

  const handleImportFromUrl = async () => {
    if (!jsonImportUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const response = await fetch(jsonImportUrl);
      if (!response.ok) {
        throw new Error('Erro ao baixar o arquivo JSON');
      }
      
      const jsonData = await response.json();
      
      // Simular um arquivo para reutilizar a função de importação existente
      const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
      const file = new File([blob], 'import.json', { type: 'application/json' });
      
      const importedCount = await importPrograms(file);
      setPrograms(getPrograms());
      setJsonImportUrl("");
      
      toast({
        title: "Sucesso",
        description: `${importedCount} programas importados com sucesso via URL`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao importar dados da URL",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSetFeatured = (id: string) => {
    setFeaturedProgram(id);
    setPrograms(getPrograms());
    toast({
      title: "Sucesso",
      description: "Programa definido como destaque",
    });
  };

  const handleRemoveFeatured = (id: string) => {
    removeFeaturedProgram(id);
    setPrograms(getPrograms());
    toast({
      title: "Sucesso",
      description: "Destaque removido do programa",
    });
  };

  const checkBrokenLinks = async () => {
    setCheckingLinks(true);
    setBrokenLinks([]);
    
    const broken: {program: Program, link: string, type: 'main' | 'episode'}[] = [];
    
    for (const program of programs) {
      // Check main program link
      if (program.link) {
        try {
          const response = await fetch(program.link, { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          // For no-cors mode, we can't check status, so we'll use a different approach
          // Check if it's a Google Drive link and if it contains error indicators
          if (program.link.includes('drive.google.com')) {
            const testResponse = await fetch(program.link).catch(() => null);
            if (!testResponse) {
              broken.push({
                program,
                link: program.link,
                type: 'main'
              });
            }
          }
        } catch (error) {
          broken.push({
            program,
            link: program.link,
            type: 'main'
          });
        }
      }
      
      // Check episode links in seasons
      if (program.seasons) {
        for (const season of program.seasons) {
          for (const episode of season.episodes) {
            if (episode.link) {
              try {
                if (episode.link.includes('drive.google.com')) {
                  const testResponse = await fetch(episode.link).catch(() => null);
                  if (!testResponse) {
                    broken.push({
                      program,
                      link: episode.link,
                      type: 'episode'
                    });
                  }
                }
              } catch (error) {
                broken.push({
                  program,
                  link: episode.link,
                  type: 'episode'
                });
              }
            }
          }
        }
      }
    }
    
    setBrokenLinks(broken);
    setShowBrokenLinks(true);
    setCheckingLinks(false);
    
    toast({
      title: checkingLinks ? "Verificação concluída" : "Erro na verificação",
      description: `Encontrados ${broken.length} links com problemas`,
      variant: broken.length > 0 ? "destructive" : "default"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="main-header fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-cinzel font-semibold">Painel Administrativo</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" className="border-border/50">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 container mx-auto px-4 py-6 max-w-7xl">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center p-4">
              <Video className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Programas</p>
                <p className="text-2xl font-bold">{programs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center p-4">
              <Play className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Filmes</p>
                <p className="text-2xl font-bold">{programs.filter(p => p.type === 'movie').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Séries</p>
                <p className="text-2xl font-bold">{programs.filter(p => p.type === 'series').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center p-4">
              <Settings className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Gêneros</p>
                <p className="text-2xl font-bold">{new Set(programs.map(p => p.genre)).size}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="programs" className="flex items-center gap-2 text-xs">
              <Video className="w-4 h-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2 text-xs">
              <Star className="w-4 h-4" />
              Destaque
            </TabsTrigger>
            <TabsTrigger value="player" className="flex items-center gap-2 text-xs">
              <Play className="w-4 h-4" />
              Player
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 text-xs">
              <Users className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Biblioteca de Conteúdo</h2>
                <p className="text-sm text-muted-foreground">Gerencie filmes, séries e suas temporadas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AddProgramDialog onAddProgram={handleAddProgram} />
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
                {!isTV && (
                  <>
                    <label htmlFor="import-file">
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-1" />
                          Importar
                        </span>
                      </Button>
                    </label>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkBrokenLinks}
                  disabled={checkingLinks}
                >
                  {checkingLinks ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Verificando...
                    </div>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Links Quebrados
                    </>
                  )}
                </Button>
                <Button variant="destructive" size="sm" onClick={clearAllData}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>

            {exportInfo && (
              <div className="mt-2 text-sm text-muted-foreground">
                Se o download não iniciar automaticamente, clique para baixar:
                <Button variant="outline" size="sm" className="ml-2" asChild>
                  <a href={exportInfo.url} download={exportInfo.filename}>Baixar backup</a>
                </Button>
              </div>
            )}

            {/* Campo de importação para TV */}
            {isTV && (
              <Card className="bg-card border-border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tv className="w-5 h-5 text-primary" />
                    Importação para TV
                  </CardTitle>
                  <CardDescription>
                    Importe dados através de uma URL JSON (específico para ambiente de TV)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="json-url" className="text-sm">URL do arquivo JSON</Label>
                      <Input
                        id="json-url"
                        type="url"
                        value={jsonImportUrl}
                        onChange={(e) => setJsonImportUrl(e.target.value)}
                        placeholder="https://exemplo.com/dados.json"
                        className="mt-1"
                        disabled={isImporting}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleImportFromUrl}
                        disabled={isImporting || !jsonImportUrl.trim()}
                        className="min-w-[120px]"
                      >
                        {isImporting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Importando...
                          </div>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-1" />
                            Importar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Broken Links Modal */}
            {showBrokenLinks && (
              <Card className="bg-card border-border border-destructive/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Links com Problemas ({brokenLinks.length})
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowBrokenLinks(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <CardDescription>
                    Links que podem estar bloqueados ou inacessíveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {brokenLinks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum link com problema encontrado!</p>
                    </div>
                  ) : (
                    brokenLinks.map((item, index) => (
                      <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={item.type === 'main' ? 'destructive' : 'secondary'}>
                                {item.type === 'main' ? 'Link Principal' : 'Episódio'}
                              </Badge>
                              <h4 className="font-medium text-sm truncate">{item.program.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground break-all">
                              {item.link}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.link, '_blank')}
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Programs Grid */}
            {programs.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo cadastrado</h3>
                  <p className="text-muted-foreground mb-4">Comece adicionando filmes e séries à sua biblioteca</p>
                  <Button onClick={() => {}} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Programa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {/* Filmes */}
                {programs.filter(p => p.type === 'movie').length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Filmes ({programs.filter(p => p.type === 'movie').length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {programs.filter(p => p.type === 'movie').map((program) => (
                          <AdminProgramCard
                            key={program.id}
                            program={program}
                            onPlay={handlePlayVideo}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onManageSeasons={(p) => {
                              setEditingProgram(p);
                              setShowSeasonManager(true);
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Séries */}
                {programs.filter(p => p.type === 'series').length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Séries ({programs.filter(p => p.type === 'series').length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {programs.filter(p => p.type === 'series').map((program) => (
                          <AdminProgramCard
                            key={program.id}
                            program={program}
                            onPlay={handlePlayVideo}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onManageSeasons={(p) => {
                              setEditingProgram(p);
                              setShowSeasonManager(true);
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Controle de Destaque
                </CardTitle>
                <CardDescription>
                  Defina qual programa aparece em destaque na página inicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const featuredProgram = getFeaturedProgram();
                  return featuredProgram ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="font-medium">Programa atual em destaque:</span>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <img
                          src={featuredProgram.poster}
                          alt={featuredProgram.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{featuredProgram.title}</h3>
                          <p className="text-muted-foreground">{featuredProgram.genre} • {featuredProgram.year}</p>
                          <p className="text-sm text-muted-foreground mt-1">{featuredProgram.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveFeatured(featuredProgram.id)}
                        >
                          Remover Destaque
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum programa em destaque</h3>
                      <p className="text-muted-foreground">Selecione um programa abaixo para destacar na página inicial</p>
                    </div>
                  );
                })()}

                {programs.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Escolher programa para destaque:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {programs.map((program) => (
                        <div
                          key={program.id}
                          className={`relative cursor-pointer group ${
                            program.featured ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleSetFeatured(program.id)}
                        >
                          <div className="aspect-[2/3] overflow-hidden rounded-lg">
                            <img
                              src={program.poster}
                              alt={program.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          {program.featured && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Star className="w-3 h-3" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-xs font-medium mt-2 text-center truncate">{program.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Tab */}
          <TabsContent value="player" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Player de Vídeo</CardTitle>
                <CardDescription>
                  {currentProgram ? `Reproduzindo: ${currentProgram.title}` : "Player integrado para reproduzir vídeos dos programas cadastrados"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentVideo && currentProgram ? (
                  <div className="space-y-4">
                    <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
                      <video 
                        src={currentVideo} 
                        controls 
                        className="w-full h-full"
                        autoPlay
                      >
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    </AspectRatio>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{currentProgram.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentProgram.genre} • {currentProgram.year} • {currentProgram.rating}/10
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentVideo}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowPlayerDialog(true)}
                          className="border-border/50"
                        >
                          Player Avançado
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentVideo("");
                            setCurrentProgram(null);
                          }}
                          className="border-border/50"
                        >
                          Fechar Player
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum vídeo selecionado</h3>
                    <p className="text-muted-foreground mb-4">
                      Selecione um programa da aba "Conteúdo" para reproduzir aqui
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("programs")}
                      className="border-border/50"
                    >
                      Ir para Conteúdo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Programas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{programs.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Gêneros Únicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(programs.map(p => p.genre)).size}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Com Vídeo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {programs.filter(p => p.videoUrl).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Genre Distribution */}
            {programs.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Distribuição por Gênero</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      programs.reduce((acc, program) => {
                        acc[program.genre] = (acc[program.genre] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([genre, count]) => (
                      <div key={genre} className="flex justify-between items-center">
                        <span>{genre}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog (controlado) */}
      <AddProgramDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialProgram={editingProgram}
        mode="edit"
        hideTrigger
        onAddProgram={(program: any) => {
          updateProgram(program.id, program);
          setPrograms(getPrograms());
          toast({
            title: "Sucesso",
            description: "Programa atualizado com sucesso",
          });
        }}
      />

      {/* Season Manager Dialog */}
      {showSeasonManager && editingProgram && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-6xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 sm:rounded-lg overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gerenciar Temporadas</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSeasonManager(false)}
              >
                Fechar
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <SeasonManager
                seasons={editingProgram.seasons || []}
                seriesTitle={editingProgram.title}
                onSeasonsUpdate={(seasons) => {
                  const updatedProgram = { ...editingProgram, seasons };
                  updateProgram(editingProgram.id, updatedProgram);
                  setPrograms(getPrograms());
                  setEditingProgram(updatedProgram);
                  toast({
                    title: "Sucesso",
                    description: "Temporadas atualizadas com sucesso",
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Video Player Dialog */}
      {currentProgram && currentVideo && (
        <AdvancedVideoPlayer
          isOpen={showPlayerDialog}
          onClose={() => setShowPlayerDialog(false)}
          videoUrl={currentVideo}
          title={currentProgram.title}
        />
      )}
    </div>
  );
};

export default AdminPanel;