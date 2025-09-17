import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Program } from "@/data/programs";
import { Edit, Play, Trash2 } from "lucide-react";

interface AdminProgramCardProps {
  program: Program;
  onPlay: (program: Program) => void;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
  onManageSeasons?: (program: Program) => void;
}

export function AdminProgramCard({ program, onPlay, onEdit, onDelete, onManageSeasons }: AdminProgramCardProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="flex gap-4 items-start">
        {/* Poster */}
        <img
          src={program.poster}
          alt={`Poster de ${program.title}`}
          className="w-20 h-28 md:w-24 md:h-32 rounded object-cover flex-none"
          loading="lazy"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-base md:text-lg font-semibold truncate">{program.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={program.type === 'series' ? 'default' : 'secondary'}>
                {program.type === 'series' ? 'Série' : 'Filme'}
              </Badge>
              <Badge variant="secondary">{program.genre}</Badge>
              <Badge variant="secondary">{program.year}</Badge>
              <Badge variant="secondary">{program.rating}/10</Badge>
            </div>
          </div>

          {program.type === 'series' && program.totalSeasons && (
            <p className="text-sm text-muted-foreground mt-1">
              {program.totalSeasons} temporada{program.totalSeasons > 1 ? 's' : ''}
              {program.status ? ` • ${program.status === 'ongoing' ? 'Em exibição' : program.status === 'completed' ? 'Finalizada' : 'Cancelada'}` : ''}
            </p>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {program.type === 'series' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onManageSeasons?.(program)}
                className="border-border/50"
              >
                Temporadas
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onPlay(program)} className="border-border/50">
              <Play className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(program)} className="border-border/50">
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(program.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
