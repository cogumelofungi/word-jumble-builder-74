import { useState } from "react";
import { Search, Plus, Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddProgramDialog } from "./AddProgramDialog";
import { Link } from "react-router-dom";

interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  activeCategory: string;
  onAddProgram: (program: any) => void;
}

const categories = [
  { id: "home", name: "Início" },
  { id: "series", name: "Séries" },
  { id: "movies", name: "Filmes" },
  { id: "favorites", name: "Minha Lista" },
  { id: "recent", name: "Adicionados Recentemente" }
];

export function Navigation({ onSearch, onCategoryChange, activeCategory, onAddProgram }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <header className="main-header fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-foreground">StreamVault</span>
            </div>

            {/* Navigation Categories */}
            <nav className="hidden md:flex items-center gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeCategory === category.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              {isSearchVisible ? (
                <div className="search-input flex items-center rounded-md overflow-hidden">
                  <Search className="w-4 h-4 text-muted-foreground ml-3" />
                  <Input
                    type="text"
                    placeholder="Buscar títulos..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchVisible(false)}
                    className="bg-transparent border-0 w-64 focus:ring-0 text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchVisible(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Add Program */}
            <AddProgramDialog onAddProgram={onAddProgram} />

            {/* Links de navegação */}
            <Link to="/versao">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                Versão
              </Button>
            </Link>

            <Link to="/painel">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}