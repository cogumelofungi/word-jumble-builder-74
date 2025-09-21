export interface Episode {
  id: string;
  title: string;
  description?: string;
  duration?: number; // em minutos
  videoUrl?: string;
  link?: string;
  watched?: boolean;
  airDate?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
  description?: string;
  episodes: Episode[];
  poster?: string;
  year: number;
}

export interface Program {
  id: string;
  title: string;
  poster: string;
  rating: number;
  category?: string;
  genre: string;
  year: number;
  isFavorite: boolean;
  description: string;
  dateAdded: string;
  link: string;
  videoUrl?: string;
  progress?: number;
  // Novos campos para séries
  type: 'movie' | 'series';
  seasons?: Season[];
  totalSeasons?: number;
  totalEpisodes?: number;
  status?: 'ongoing' | 'completed' | 'cancelled';
  // Campo para programa em destaque
  featured?: boolean;
}

const STORAGE_KEY = 'streamflix-programs';

// Função para carregar do localStorage
const loadFromStorage = (): Program[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
  }
  return []; // Retorna array vazio por padrão
};

// Função para salvar no localStorage
const saveToStorage = (programs: Program[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
};

// A plataforma inicia sempre sem programas

// Dados compartilhados - carrega do localStorage
export let sharedPrograms: Program[] = loadFromStorage();

// Função para adicionar um programa
export const addProgram = (program: Program) => {
  sharedPrograms = [program, ...sharedPrograms];
  saveToStorage(sharedPrograms);
};

// Função para atualizar um programa
export const updateProgram = (id: string, updates: Partial<Program>) => {
  sharedPrograms = sharedPrograms.map(program =>
    program.id === id ? { ...program, ...updates } : program
  );
  saveToStorage(sharedPrograms);
};

// Função para obter todos os programas
export const getPrograms = () => {
  return [...sharedPrograms];
};

// Função para obter um programa por ID
export const getProgramById = (id: string) => {
  return sharedPrograms.find(program => program.id === id);
};

// Função para deletar um programa
export const deleteProgram = (id: string) => {
  sharedPrograms = sharedPrograms.filter(program => program.id !== id);
  saveToStorage(sharedPrograms);
};

// Função para forçar limpeza inicial (útil para desenvolvimento)
export const resetToEmpty = () => {
  localStorage.removeItem(STORAGE_KEY);
  sharedPrograms = [];
  console.log('Dados limpos - plataforma resetada para estado vazio');
};

// Função para limpar todos os programas
export const clearAllPrograms = () => {
  sharedPrograms = [];
  saveToStorage(sharedPrograms);
};

// Função para reordenar programas
export const reorderPrograms = (fromIndex: number, toIndex: number) => {
  const newPrograms = [...sharedPrograms];
  const [removed] = newPrograms.splice(fromIndex, 1);
  newPrograms.splice(toIndex, 0, removed);
  sharedPrograms = newPrograms;
  saveToStorage(sharedPrograms);
};

// Função para obter índice de um programa
export const getProgramIndex = (id: string) => {
  return sharedPrograms.findIndex(program => program.id === id);
};
export const exportPrograms = () => {
  const dataStr = JSON.stringify(sharedPrograms, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `streamflix-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Função para importar dados de JSON
// Função para definir programa em destaque
export const setFeaturedProgram = (id: string) => {
  // Remove destaque de todos os programas
  sharedPrograms = sharedPrograms.map(program => ({ ...program, featured: false }));
  // Define o programa específico como destaque
  sharedPrograms = sharedPrograms.map(program =>
    program.id === id ? { ...program, featured: true } : program
  );
  saveToStorage(sharedPrograms);
};

// Função para remover destaque de um programa
export const removeFeaturedProgram = (id: string) => {
  sharedPrograms = sharedPrograms.map(program =>
    program.id === id ? { ...program, featured: false } : program
  );
  saveToStorage(sharedPrograms);
};

// Função para obter programa em destaque
export const getFeaturedProgram = () => {
  return sharedPrograms.find(program => program.featured);
};

export const importPrograms = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importedPrograms: Program[] = JSON.parse(result);
        
        // Validação básica
        if (!Array.isArray(importedPrograms)) {
          throw new Error('Arquivo não contém um array válido');
        }
        
        // Mescla com programas existentes, evitando duplicatas por ID
        const existingIds = new Set(sharedPrograms.map(p => p.id));
        const newPrograms = importedPrograms.filter(p => !existingIds.has(p.id));
        
        sharedPrograms = [...sharedPrograms, ...newPrograms];
        saveToStorage(sharedPrograms);
        
        resolve(newPrograms.length);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo JSON: ' + (error as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};