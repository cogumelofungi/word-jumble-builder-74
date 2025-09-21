import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Program } from "@/data/programs";
interface AddProgramDialogProps {
  onAddProgram: (program: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialProgram?: Program | null;
  mode?: 'add' | 'edit';
  hideTrigger?: boolean;
}

export function AddProgramDialog({ onAddProgram, open, onOpenChange, initialProgram, mode = 'add', hideTrigger = false }: AddProgramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlled = typeof open === 'boolean';
  const dialogOpen = controlled ? (open as boolean) : isOpen;
  const setDialogOpen = controlled ? (onOpenChange || (() => {})) : setIsOpen;
  const [formData, setFormData] = useState({
    title: "",
    posterUrl: "",
    category: "",
    genre: "",
    year: new Date().getFullYear(),
    rating: 8.0,
    description: "",
    link: "",
    videoUrl: "",
    // Campos específicos para séries
    type: "movie" as "movie" | "series",
    seasonNumber: 1,
    episodeNumber: 1,
    episodeTitle: "",
    episodeDuration: 45,
    airDate: ""
  });
  const { toast } = useToast();

  // Preencher formulário ao abrir em modo de edição
  useEffect(() => {
    if (initialProgram && dialogOpen) {
      setFormData({
        title: initialProgram.title || "",
        posterUrl: initialProgram.poster || "",
        category: initialProgram.type === 'series' ? 'Série' : 'Filme',
        genre: initialProgram.genre || "",
        year: initialProgram.year || new Date().getFullYear(),
        rating: initialProgram.rating || 8.0,
        description: initialProgram.description || "",
        link: initialProgram.link || "",
        videoUrl: initialProgram.videoUrl || "",
        type: initialProgram.type,
        seasonNumber: 1,
        episodeNumber: 1,
        episodeTitle: "",
        episodeDuration: 45,
        airDate: ""
      });
    }
  }, [initialProgram, dialogOpen]);

  const genres = [
    "Ação", "Aventura", "Comédia", "Drama", "Fantasia", "Terror", 
    "Mistério", "Romance", "Ficção Científica", "Suspense", "Documentário", "Animação"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do programa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const isSeries = formData.category === "Série";
    const placeholderPoster = "https://via.placeholder.com/300x450/1a1a1a/666666?text=Sem+Poster";
    const isEdit = mode === 'edit' || !!initialProgram;
    
    let programToSave: any;

    if (isEdit && initialProgram) {
      programToSave = {
        ...initialProgram,
        title: formData.title,
        poster: formData.posterUrl || placeholderPoster,
        category: formData.category || initialProgram.category,
        genre: formData.genre || "Desconhecido",
        year: formData.year,
        rating: formData.rating,
        description: formData.description,
        link: formData.link,
        videoUrl: formData.videoUrl,
        type: isSeries ? "series" : "movie",
      };
    } else {
      programToSave = {
        id: Date.now().toString(),
        title: formData.title,
        poster: formData.posterUrl || placeholderPoster,
        category: formData.category || "Filme",
        genre: formData.genre || "Desconhecido",
        year: formData.year,
        rating: formData.rating,
        description: formData.description,
        link: formData.link,
        videoUrl: formData.videoUrl,
        isFavorite: false,
        dateAdded: new Date().toISOString(),
        type: isSeries ? "series" as const : "movie" as const,
        ...(isSeries && {
          seasons: [{
            id: Date.now().toString(),
            seasonNumber: formData.seasonNumber,
            title: `Temporada ${formData.seasonNumber}`,
            description: "",
            year: formData.year,
            episodes: [{
              id: (Date.now() + 1).toString(),
              title: formData.episodeTitle || `Episódio ${formData.episodeNumber}`,
              description: formData.description,
              duration: formData.episodeDuration,
              videoUrl: formData.videoUrl,
              link: formData.link,
              airDate: formData.airDate,
              watched: false
            }]
          }],
          totalSeasons: 1,
          totalEpisodes: 1,
          status: "ongoing" as const
        })
      };
    }

    onAddProgram(programToSave);
    setDialogOpen(false);
    setFormData({
      title: "",
      posterUrl: "",
      category: "",
      genre: "",
      year: new Date().getFullYear(),
      rating: 8.0,
      description: "",
      link: "",
      videoUrl: "",
      type: "movie" as const,
      seasonNumber: 1,
      episodeNumber: 1,
      episodeTitle: "",
      episodeDuration: 45,
      airDate: ""
    });

    toast({
      title: "Sucesso",
      description: isEdit ? "Programa atualizado" : "Programa adicionado à sua coleção",
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Programa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl w-[90vw] max-h-[85vh] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 sticky top-0 bg-card z-10 border-b border-border/20">
          <DialogTitle className="text-xl font-cinzel">{mode === 'edit' ? 'Editar Programa' : 'Adicionar Novo Programa'}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Preencha os dados básicos do programa.</DialogDescription>
        </DialogHeader>
        
        <div className="px-4 pb-4 max-h-[calc(85vh-80px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Preview Section - Esquerda */}
              <div className="w-full md:w-48 flex-shrink-0">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="posterUrl" className="text-sm">URL do Poster</Label>
                    <Input
                      id="posterUrl"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, posterUrl: e.target.value }))}
                      placeholder="https://exemplo.com/poster.jpg"
                      className="mt-1 text-sm"
                    />
                  </div>
                  
                  {/* Preview do Poster */}
                  <div className="aspect-[2/3] bg-surface-dark border border-border/30 rounded-lg overflow-hidden">
                    {formData.posterUrl ? (
                      <img 
                        src={formData.posterUrl} 
                        alt="Preview do poster" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450/1a1a1a/666666?text=Poster+Inválido";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulário - Direita */}
              <div className="flex-1 space-y-4">
                {/* Informações Básicas */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-sm">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do programa"
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="category" className="text-sm">Categoria</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1 h-8">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Série">Série</SelectItem>
                          <SelectItem value="Filme">Filme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="genre" className="text-sm">Gênero</Label>
                      <Select 
                        value={formData.genre} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
                      >
                        <SelectTrigger className="mt-1 h-8">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="year" className="text-sm">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        className="mt-1 h-8 text-sm"
                        min="1900"
                        max="2030"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating" className="text-sm">Avaliação</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="10"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 8.0 }))}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="link" className="text-sm">Link do Vídeo (Unificado)</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="Google Drive, Archive.org, YouTube, etc..."
                      className="mt-1 h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Suporta: Google Drive, Archive.org, YouTube e links diretos
                    </p>
                  </div>
                </div>

                {/* Campos específicos para Séries */}
                {formData.category === "Série" && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Episódio Inicial</h4>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="seasonNumber" className="text-xs">Temporada</Label>
                        <Input
                          id="seasonNumber"
                          type="number"
                          value={formData.seasonNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, seasonNumber: parseInt(e.target.value) || 1 }))}
                          className="mt-1 h-7 text-sm"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="episodeNumber" className="text-xs">Episódio</Label>
                        <Input
                          id="episodeNumber"
                          type="number"
                          value={formData.episodeNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, episodeNumber: parseInt(e.target.value) || 1 }))}
                          className="mt-1 h-7 text-sm"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="episodeDuration" className="text-xs">Duração</Label>
                        <Input
                          id="episodeDuration"
                          type="number"
                          value={formData.episodeDuration}
                          onChange={(e) => setFormData(prev => ({ ...prev, episodeDuration: parseInt(e.target.value) || 45 }))}
                          className="mt-1 h-7 text-sm"
                          min="1"
                        />
                      </div>
                    </div>
                   </div>
                 )}

                 {/* Descrição */}
                <div>
                  <Label htmlFor="description" className="text-sm">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descrição do programa..."
                    className="mt-1 h-20 resize-none text-sm"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-3 border-t border-border/20">
                  <Button type="submit" size="sm" className="btn-primary flex-1">
                    {mode === 'edit' ? 'Salvar Alterações' : 'Adicionar Programa'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDialogOpen(false)}
                    className="border-border/50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}