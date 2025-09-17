export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const triggerHapticFeedback = (pattern?: number | number[]) => {
  if (navigator.vibrate && isTouchDevice()) {
    navigator.vibrate(pattern || 50);
  }
};

export const addLongPressHandler = (
  element: HTMLElement, 
  onLongPress: () => void, 
  delay: number = 500
) => {
  let pressTimer: NodeJS.Timeout;
  
  const startPress = () => {
    pressTimer = setTimeout(() => {
      triggerHapticFeedback();
      onLongPress();
    }, delay);
  };
  
  const endPress = () => {
    clearTimeout(pressTimer);
  };
  
  element.addEventListener('touchstart', startPress);
  element.addEventListener('touchend', endPress);
  element.addEventListener('touchcancel', endPress);
  element.addEventListener('mousedown', startPress);
  element.addEventListener('mouseup', endPress);
  element.addEventListener('mouseleave', endPress);
  
  return () => {
    element.removeEventListener('touchstart', startPress);
    element.removeEventListener('touchend', endPress);
    element.removeEventListener('touchcancel', endPress);
    element.removeEventListener('mousedown', startPress);
    element.removeEventListener('mouseup', endPress);
    element.removeEventListener('mouseleave', endPress);
  };
};