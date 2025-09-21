import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { VideoLoader } from './VideoLoader';


interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({ isOpen, onClose, videoUrl, title, onProgress }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract Google Drive file ID from URL
  const getGoogleDriveId = (url: string) => {
    const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is Google Drive
  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  // Check if URL is Archive.org
  const isArchiveOrgUrl = (url: string) => {
    return url.includes('archive.org');
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const youtubeId = isYouTubeUrl(videoUrl) ? getYouTubeId(videoUrl) : null;
  const googleDriveId = isGoogleDriveUrl(videoUrl) ? getGoogleDriveId(videoUrl) : null;
  const isArchive = isArchiveOrgUrl(videoUrl);

  // Refs e timers para carregamento do Google Drive
  const driveLoadStartRef = useRef<number | null>(null);
  const fallbackErrorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('VideoPlayer opened with URL:', videoUrl);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setShowErrorDialog(false);

      if (googleDriveId) {
        console.log('Google Drive video detected:', googleDriveId);
        driveLoadStartRef.current = Date.now();
        // Aumenta o timeout para 15s e remove a heurística de carregamento rápido
        if (fallbackErrorTimerRef.current) {
          clearTimeout(fallbackErrorTimerRef.current as any);
        }
        fallbackErrorTimerRef.current = window.setTimeout(() => {
          console.log('Google Drive timeout - ainda carregando após 15s');
          setIsLoading(false); // Remove loading mas não força erro
        }, 15000);
      } else if (isArchive) {
        console.log('Archive.org video detected');
        // Para archive.org, apenas inicia o loading sem heurística de erro
        driveLoadStartRef.current = Date.now();
      } else if (youtubeId) {
        console.log('YouTube video detected:', youtubeId);
        // Para YouTube, remove o loading imediatamente já que não temos controle sobre o iframe
        setIsLoading(false);
      } else {
        console.log('Direct video URL detected');
        // Para vídeos diretos, o loading será controlado pelos eventos do video
      }
    }
    return () => {
      if (fallbackErrorTimerRef.current) {
        clearTimeout(fallbackErrorTimerRef.current as any);
        fallbackErrorTimerRef.current = null;
      }
    };
  }, [isOpen, videoUrl, googleDriveId, isArchive]);

  const handleDriveIframeLoad = () => {
    const start = driveLoadStartRef.current ?? Date.now();
    const elapsed = Date.now() - start;

    console.log('Iframe loaded, elapsed time:', elapsed, 'ms');
    setIsLoading(false);

    if (fallbackErrorTimerRef.current) {
      clearTimeout(fallbackErrorTimerRef.current as any);
      fallbackErrorTimerRef.current = null;
    }

    // Remove a heurística automática de erro - deixa o usuário decidir se há problema
    console.log('Google Drive iframe loaded successfully');
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    onClose();
    // Voltar para a tela inicial
    window.location.href = '/';
  };

  const renderPlayer = () => {
    if (youtubeId) {
      // YouTube embed with minimal controls
      return (
        <div className="relative w-full h-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&fs=1&iv_load_policy=3&disablekb=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }

    if (googleDriveId) {
      // Google Drive embed com loading e heurística de erro
      return (
        <div className="relative w-full h-full bg-black">
          {isLoading && <VideoLoader title={title} />}
          <iframe
            src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
            title={title}
            className="w-full h-full"
            onLoad={handleDriveIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }

    if (isArchive) {
      // Archive.org embed similar to Google Drive
      return (
        <div className="relative w-full h-full bg-black">
          {isLoading && <VideoLoader title={title} />}
          <iframe
            src={videoUrl}
            title={title}
            className="w-full h-full"
            onLoad={handleDriveIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{
              border: 'none',
              zoom: 1,
              transform: 'scale(1)',
              objectFit: 'contain'
            }}
          />
        </div>
      );
    }

    // For other video URLs (direct video files) - with loading events
    return (
      <div className="relative w-full h-full bg-black">
        {isLoading && <VideoLoader title={title} />}
        <video
          src={videoUrl}
          className="w-full h-full object-contain"
          autoPlay
          loop
          onLoadStart={() => {
            console.log('Video load started');
            setIsLoading(true);
          }}
          onCanPlay={() => {
            console.log('Video can play - removing loading');
            setIsLoading(false);
          }}
          onWaiting={() => {
            console.log('Video waiting - showing loading');
            setIsLoading(true);
          }}
          onError={(e) => {
            console.error('Video error:', e);
            setIsLoading(false);
          }}
          onLoadedData={() => {
            console.log('Video data loaded');
            setIsLoading(false);
          }}
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            setCurrentTime(video.currentTime);
            if (onProgress && video.duration) {
              onProgress((video.currentTime / video.duration) * 100);
            }
          }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            setDuration(video.duration);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={(e) => {
            const video = e.target as HTMLVideoElement;
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }}
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full w-screen h-screen p-0 m-0 bg-black border-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-50">
          {/* Full screen video */}
          <div className="w-full h-full">
            {renderPlayer()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog for Google Drive Issues */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Episódio com problema
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este episódio está temporariamente indisponível devido a uma limitação do Google Drive. 
              Nossa equipe já está trabalhando para resolver este problema o mais rápido possível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              Voltar à tela inicial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}