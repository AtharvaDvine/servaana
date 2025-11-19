// Simple and reliable notification sound system
export const playNotificationSound = (soundType, volume, enabled) => {
  if (!enabled) return;
  
  try {
    // Create audio context for generating sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const playTone = (frequency, duration, delay = 0) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine'; // Smoother sound
        
        // Set volume and fade out
        gainNode.gain.setValueAtTime(volume / 100 * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }, delay);
    };
    
    // Different sound patterns
    switch (soundType) {
      case 'success':
        // Pleasant success chord: C-E-G
        playTone(523.25, 0.8, 0);    // C5
        playTone(659.25, 0.8, 200);  // E5
        playTone(783.99, 0.8, 400);  // G5
        break;
        
      case 'warning':
        // Urgent warning beeps
        playTone(440, 0.3, 0);
        playTone(440, 0.3, 400);
        playTone(440, 0.3, 800);
        break;
        
      case 'notification':
        // Gentle notification
        playTone(800, 0.4, 0);
        playTone(1000, 0.4, 200);
        break;
        
      case 'bell':
        // Bell-like sound
        playTone(523.25, 0.6, 0);
        playTone(659.25, 0.6, 300);
        break;
        
      default:
        // Simple beep
        playTone(800, 0.6, 0);
        break;
    }
    
  } catch (error) {
    console.warn('Audio playback failed:', error);
    // Fallback: system beep
    try {
      // Create a simple beep as fallback
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = volume / 100;
      audio.play().catch(() => {});
    } catch (fallbackError) {
      console.warn('Fallback audio also failed:', fallbackError);
    }
  }
};

export const showBrowserNotification = (title, body, enabled) => {
  if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    requireInteraction: false,
    silent: true // We handle sound separately
  });
  
  // Auto-close notification after 4 seconds
  setTimeout(() => {
    notification.close();
  }, 4000);
};