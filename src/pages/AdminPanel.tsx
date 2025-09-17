import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Plus, Edit, Trash2, Play, ExternalLink, Home, Settings, Users, Video, Download, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Program, getPrograms, addProgram, updateProgram, deleteProgram, clearAllPrograms, exportPrograms, importPrograms } from "@/data/programs";
import { SeasonManager } from "@/components/SeasonManager";
import { AdminProgramCard } from "@/components/AdminProgramCard";
import { AddProgramDialog } from "@/components/AddProgramDialog";

const AdminPanel = () => {
  const [programs, setPrograms] = useState<Program[]>(() => getPrograms());
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [showSeasonManager, setShowSeasonManager] = useState(false);
  const { toast } = useToast();

  // Sync with shared programs data
  useEffect(() => {
    setPrograms(getPrograms());
  }, []);

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
    if (program.videoUrl) {
      setCurrentVideo(program.videoUrl);
    } else if (program.link) {
      window.open(program.link, '_blank');
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
    exportPrograms();
    toast({
      title: "Sucesso",
      description: "Dados exportados com sucesso",
    });
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

        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="programs" className="flex items-center gap-2 text-xs">
              <Video className="w-4 h-4" />
              Conteúdo
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
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
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
                <Button variant="destructive" size="sm" onClick={clearAllData}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
                <AddProgramDialog onAddProgram={handleAddProgram} />
              </div>
            </div>

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


          {/* Player Tab */}
          <TabsContent value="player" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Player de Vídeo</CardTitle>
                <CardDescription>
                  Player integrado para reproduzir vídeos dos programas cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentVideo ? (
                  <div className="space-y-4">
                    <AspectRatio ratio={16 / 9} className="bg-charcoal-black rounded-lg overflow-hidden">
                      <video 
                        src={currentVideo} 
                        controls 
                        className="w-full h-full"
                        autoPlay
                      >
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    </AspectRatio>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Reproduzindo: {currentVideo}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentVideo("")}
                        className="border-border/50"
                      >
                        Fechar Player
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum vídeo selecionado</h3>
                    <p className="text-muted-foreground mb-4">
                      Selecione um programa da lista para reproduzir
                    </p>
                    {programs.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {programs.filter(p => p.videoUrl).map((program) => (
                          <div key={program.id} className="text-center">
                            <div 
                              className="program-card aspect-[2/3] cursor-pointer mb-2"
                              onClick={() => handlePlayVideo(program)}
                            >
                              <img
                                src={program.poster}
                                alt={program.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <p className="text-sm font-medium">{program.title}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
    </div>
  );
};

export default AdminPanel;