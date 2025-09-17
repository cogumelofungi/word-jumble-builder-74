import { ArrowDown, Move } from "lucide-react";

interface DragIndicatorProps {
  isActive: boolean;
  message?: string;
  position?: 'top' | 'bottom' | 'center';
}

export function DragIndicator({ 
  isActive, 
  message = "Soltar aqui", 
  position = 'center' 
}: DragIndicatorProps) {
  if (!isActive) return null;

  const positionClasses = {
    top: 'top-0 -translate-y-full',
    bottom: 'bottom-0 translate-y-full', 
    center: 'top-1/2 -translate-y-1/2'
  };

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 ${positionClasses[position]} z-20 pointer-events-none`}>
      <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-primary/20 flex items-center gap-1.5 animate-pulse">
        <Move className="w-3 h-3" />
        {message}
        <ArrowDown className="w-3 h-3 animate-bounce" />
      </div>
    </div>
  );
}