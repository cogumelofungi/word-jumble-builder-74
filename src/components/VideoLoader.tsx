import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface VideoLoaderProps {
  title?: string;
}

export function VideoLoader({ title }: VideoLoaderProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black backdrop-blur-sm z-50">
      <div className="flex flex-col items-center space-y-8 animate-fade-in">
        {/* Main loading animation */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-24 h-24 border-4 border-white/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
          
          {/* Inner ring */}
          <div className="absolute inset-2 w-20 h-20 border-4 border-t-primary border-r-primary/60 border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
          
          {/* Center play icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
              <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-white text-xl font-semibold">
            Preparando o vídeo{dots}
          </h3>
          {title && (
            <p className="text-white/70 text-sm max-w-md">
              {title}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-[slide-in-right_2s_ease-out_infinite]"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full animate-[fade-in_2s_ease-out_infinite]"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.3}s`,
                animation: `fade-in 3s ease-out infinite ${i * 0.5}s, scale-in 2s ease-out infinite ${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}