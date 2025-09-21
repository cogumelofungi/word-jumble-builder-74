import { useState, useEffect } from 'react';

export const useTVDetection = () => {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    const detectTV = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      
      // Detectar baseado em user agent (principal método)
      const tvUserAgents = [
        'smart-tv',
        'smarttv',
        'tizen',
        'webos',
        'roku',
        'android tv',
        'googletv',
        'appletv',
        'firetv',
        'chromecast'
      ];
      
      const isTVUserAgent = tvUserAgents.some(agent => userAgent.includes(agent));
      
      // Se detectado por user agent, é definitivamente uma TV
      if (isTVUserAgent) return true;
      
      // Detectar se não há capacidades de mouse/touch (indicativo de TV)
      const hasNoTouch = !('ontouchstart' in window);
      const hasNoPointer = !window.matchMedia('(pointer: fine)').matches;
      const hasNoHover = !window.matchMedia('(hover: hover)').matches;
      
      // Detectar se está em fullscreen permanente
      const isAlwaysFullscreen = window.innerWidth === screen.width && 
                                 window.innerHeight === screen.height;
      
      // Para ser considerado TV sem user agent específico, deve ter:
      // 1. Não ter capacidades de input típicas de desktop/mobile
      // 2. Estar sempre em fullscreen
      // 3. Ter resolução alta (evitando dispositivos móveis pequenos)
      const isProbablyTV = hasNoTouch && hasNoPointer && hasNoHover && 
                          isAlwaysFullscreen && screenWidth >= 1920;
      
      return isProbablyTV;
    };

    setIsTV(detectTV());

    // Re-verificar em mudanças de tela
    const handleResize = () => {
      setIsTV(detectTV());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTV;
};