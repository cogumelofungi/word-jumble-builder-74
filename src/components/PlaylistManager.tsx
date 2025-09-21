import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, ListPlus, Trash2, Play, Heart, Edit3, 
  Folder, FolderOpen, X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Program } from "@/data/programs";
import { Checkbox } from "@/components/ui/checkbox";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  programIds: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

interface PlaylistManagerProps {
  programs: Program[];
  onPlayProgram: (programId: string) => void;
}

const PLAYLIST_STORAGE_KEY = 'streamflix-playlists';

export function PlaylistManager({ programs, onPlayProgram }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const { toast } = useToast();

  // Load playlists from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (saved) {
      try {
        setPlaylists(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading playlists:', error);
      }
    }
  }, []);

  // Save playlists to localStorage
  const savePlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(newPlaylists));
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a playlist",
        variant: "destructive"
      });
      return;
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim(),
      programIds: selectedPrograms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: getRandomColor()
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    savePlaylists(updatedPlaylists);

    toast({
      title: "Playlist criada",
      description: `"${newPlaylist.name}" foi criada com ${selectedPrograms.length} programa(s)`,
    });

    // Reset form
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setSelectedPrograms([]);
    setIsCreateDialogOpen(false);
  };

  const editPlaylist = () => {
    if (!selectedPlaylist || !newPlaylistName.trim()) return;

    const updatedPlaylists = playlists.map(playlist =>
      playlist.id === selectedPlaylist.id
        ? {
            ...playlist,
            name: newPlaylistName.trim(),
            description: newPlaylistDescription.trim(),
            programIds: selectedPrograms,
            updatedAt: new Date().toISOString()
          }
        : playlist
    );

    savePlaylists(updatedPlaylists);

    toast({
      title: "Playlist atualizada",
      description: `"${newPlaylistName}" foi atualizada`,
    });

    setIsEditDialogOpen(false);
    setSelectedPlaylist(null);
    resetForm();
  };

  const deletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    savePlaylists(updatedPlaylists);

    toast({
      title: "Playlist removida",
      description: `"${playlist.name}" foi removida`,
    });
  };

  const openEditDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDescription(playlist.description || "");
    setSelectedPrograms(playlist.programIds);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setSelectedPrograms([]);
    setSelectedPlaylist(null);
  };

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const getRandomColor = () => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getPlaylistPrograms = (playlist: Playlist) => {
    return programs.filter(program => playlist.programIds.includes(program.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Folder className="w-6 h-6 text-primary" />
            Minhas Listas
          </h2>
          <p className="text-muted-foreground mt-1">
            Organize seus programas em listas personalizadas
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Lista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Lista</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist-name">Nome da Lista</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Ex: Filmes de Ação, Séries para Maratonar..."
                />
              </div>
              
              <div>
                <Label htmlFor="playlist-description">Descrição (opcional)</Label>
                <Textarea
                  id="playlist-description"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Descreva sua lista..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Programas da Lista</Label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 mt-2">
                  {programs.map(program => (
                    <div key={program.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`program-${program.id}`}
                        checked={selectedPrograms.includes(program.id)}
                        onCheckedChange={() => toggleProgramSelection(program.id)}
                      />
                      <label htmlFor={`program-${program.id}`} className="text-sm truncate cursor-pointer">
                        {program.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createPlaylist} className="flex-1">
                  <ListPlus className="w-4 h-4 mr-2" />
                  Criar Lista
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma lista criada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira lista para organizar seus programas favoritos
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira lista
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map(playlist => {
            const playlistPrograms = getPlaylistPrograms(playlist);
            
            return (
              <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${playlist.color || 'bg-primary'}`} />
                      <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(playlist)}
                        className="h-8 w-8"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePlaylist(playlist.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground">{playlist.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {playlistPrograms.length} programa(s)
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(playlist.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {playlistPrograms.length > 0 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-1">
                        {playlistPrograms.slice(0, 4).map(program => (
                          <div
                            key={program.id}
                            className="aspect-[2/3] bg-muted rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onPlayProgram(program.id)}
                          >
                            <img
                              src={program.poster}
                              alt={program.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {playlistPrograms.length > 4 && (
                        <p className="text-xs text-muted-foreground">
                          +{playlistPrograms.length - 4} mais
                        </p>
                      )}
                    </div>
                  )}
                  
                  {playlistPrograms.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => {
                        // Play first program in playlist
                        if (playlistPrograms[0]) {
                          onPlayProgram(playlistPrograms[0].id);
                        }
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Reproduzir Lista
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lista</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-playlist-name">Nome da Lista</Label>
              <Input
                id="edit-playlist-name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-playlist-description">Descrição</Label>
              <Textarea
                id="edit-playlist-description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Programas da Lista</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 mt-2">
                {programs.map(program => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-program-${program.id}`}
                      checked={selectedPrograms.includes(program.id)}
                      onCheckedChange={() => toggleProgramSelection(program.id)}
                    />
                    <label htmlFor={`edit-program-${program.id}`} className="text-sm truncate cursor-pointer">
                      {program.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={editPlaylist} className="flex-1">
                Salvar Alterações
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}