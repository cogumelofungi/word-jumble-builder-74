import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  onNavigate?: (href: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate?.('home')}
      >
        <Home className="w-4 h-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          {item.href && !item.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate?.(item.href!)}
            >
              {item.label}
            </Button>
          ) : (
            <span className={item.isActive ? 'text-foreground font-medium' : ''}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}