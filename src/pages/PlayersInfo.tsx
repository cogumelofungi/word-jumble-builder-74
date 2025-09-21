import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Play, Settings, Volume2, Gauge, Type, Maximize, Youtube, HardDrive, Archive } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlayersInfo() {
  const players = [
    {
      id: "video-player",
      name: "Player Básico",
      description: "Player simples e otimizado para reprodução rápida",
      icon: <Play className="w-8 h-8" />,
      features: [
        "Reprodução automática",
        "Controles básicos",
        "Suporte para YouTube",
        "Suporte para Google Drive",
        "Suporte para Archive.org",
        "Suporte para vídeos diretos"
      ],
      compatibility: [
        { platform: "YouTube", icon: <Youtube className="w-4 h-4" />, status: "total" },
        { platform: "Google Drive", icon: <HardDrive className="w-4 h-4" />, status: "total" },
        { platform: "Archive.org", icon: <Archive className="w-4 h-4" />, status: "total" },
        { platform: "Vídeos MP4/WebM", icon: <Play className="w-4 h-4" />, status: "total" }
      ],
      usedFor: "Reprodução simples e rápida, especialmente para TVs e dispositivos com menos recursos"
    },
    {
      id: "advanced-video-player",
      name: "Player Avançado",
      description: "Player completo com controles avançados e personalização",
      icon: <Settings className="w-8 h-8" />,
      features: [
        "Controles de volume granulares",
        "Velocidade de reprodução ajustável",
        "Suporte para legendas",
        "Modo tela cheia",
        "Controles de tempo precisos",
        "Skip de 10 segundos",
        "Interface responsiva"
      ],
      compatibility: [
        { platform: "YouTube", icon: <Youtube className="w-4 h-4" />, status: "parcial" },
        { platform: "Vídeos MP4/WebM", icon: <Play className="w-4 h-4" />, status: "total" },
        { platform: "Google Drive", icon: <HardDrive className="w-4 h-4" />, status: "limitado" },
        { platform: "Archive.org", icon: <Archive className="w-4 h-4" />, status: "limitado" }
      ],
      usedFor: "Experiência premium de visualização com controles completos",
      controls: [
        { icon: <Volume2 className="w-4 h-4" />, name: "Volume", desc: "Controle deslizante de volume" },
        { icon: <Gauge className="w-4 h-4" />, name: "Velocidade", desc: "0.25x até 2x" },
        { icon: <Type className="w-4 h-4" />, name: "Legendas", desc: "Suporte para múltiplas legendas" },
        { icon: <Maximize className="w-4 h-4" />, name: "Tela Cheia", desc: "Modo de tela cheia nativo" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "total": return "bg-green-500";
      case "parcial": return "bg-yellow-500";
      case "limitado": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "total": return "Suporte Total";
      case "parcial": return "Suporte Parcial";
      case "limitado": return "Suporte Limitado";
      default: return "Não Suportado";
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-semibold">StreamVault</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/painel">Painel Admin</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Players Disponíveis</h1>
          <p className="text-muted-foreground">
            Conheça os diferentes players de vídeo e suas funcionalidades
          </p>
        </div>

        {/* Players Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {players.map((player) => (
            <Card key={player.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {player.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{player.name}</CardTitle>
                    <CardDescription>{player.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Uso Recomendado */}
                <div>
                  <h3 className="font-semibold mb-2">Quando Usar</h3>
                  <p className="text-sm text-muted-foreground">{player.usedFor}</p>
                </div>

                {/* Recursos */}
                <div>
                  <h3 className="font-semibold mb-3">Recursos</h3>
                  <div className="grid gap-2">
                    {player.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controles Avançados (apenas para Advanced Player) */}
                {player.controls && (
                  <div>
                    <h3 className="font-semibold mb-3">Controles Avançados</h3>
                    <div className="grid gap-2">
                      {player.controls.map((control, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg">
                          <div className="p-1 bg-background rounded text-muted-foreground">
                            {control.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{control.name}</div>
                            <div className="text-xs text-muted-foreground">{control.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compatibilidade */}
                <div>
                  <h3 className="font-semibold mb-3">Compatibilidade</h3>
                  <div className="space-y-2">
                    {player.compatibility.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="text-muted-foreground">
                            {platform.icon}
                          </div>
                          <span className="text-sm font-medium">{platform.platform}</span>
                        </div>
                        <Badge variant="secondary" className={`text-white ${getStatusColor(platform.status)}`}>
                          {getStatusText(platform.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações Gerais */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Funciona a Seleção Automática</CardTitle>
            <CardDescription>
              O sistema escolhe automaticamente o melhor player baseado no tipo de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold">Player Básico é usado para:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Vídeos do YouTube (controles nativos)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Google Drive (reprodução em iframe)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Archive.org (reprodução em iframe)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Dispositivos com recursos limitados
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Player Avançado é usado para:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Arquivos de vídeo diretos (MP4, WebM)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Quando precisar de controles avançados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Conteúdo com legendas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Experiência de visualização premium
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}