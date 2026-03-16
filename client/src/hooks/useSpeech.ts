import { useState, useRef, useCallback, useEffect } from 'react';
type SpeechState = 'idle' | 'listening' | 'error';
interface UseSpeechReturn {
  transcript: string;
  state: SpeechState;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  isSpeaking: boolean;
  cancelSpeech: () => void;
  unlockAudio: () => void;
}
export function useSpeech(): UseSpeechReturn {
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeechState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const unlockedRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  // Load voices asynchronously (Chrome loads them late)
  useEffect(() => {
    const loadVoices = () => {
      const v = synthRef.current.getVoices();
      if (v.length > 0) voicesRef.current = v;
    };
    loadVoices();
    synthRef.current.addEventListener('voiceschanged', loadVoices);
    return () => {
      synthRef.current.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);
  // Chrome TTS keep-alive: Chrome pauses speechSynthesis after ~15s of speaking
  // Calling resume() on an interval prevents the silent stall bug
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) return;
    keepAliveRef.current = setInterval(() => {
      if (synthRef.current.speaking && synthRef.current.paused) {
        synthRef.current.resume();
      }
    }, 5000);
  }, []);
  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);
  // Unlock audio context — must be called from a direct user interaction (click)
  // Speaks a silent utterance to bypass Chrome autoplay policy
  const unlockAudio = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    const utter = new SpeechSynthesisUtterance(' ');
    utter.volume = 0;
    utter.rate = 10;
    synthRef.current.speak(utter);
    synthRef.current.cancel();
  }, []);
  const startListening = useCallback(() => {
    if (!isSupported) return;
    unlockAudio();
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: typeof globalThis.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof globalThis.SpeechRecognition }).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setState('listening');
    recognition.onerror = () => setState('idle');
    recognition.onend = () => setState('idle');
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, unlockAudio]);
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);
  const resetTranscript = useCallback(() => setTranscript(''), []);
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    // Cancel any ongoing speech first
    synthRef.current.cancel();
    stopKeepAlive();
    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.92;
      utter.pitch = 0.8;
      utter.volume = 1;
      // Pick best available English voice (prefer a male/deep voice for Jarvis)
      const voices = voicesRef.current.length
        ? voicesRef.current
        : synthRef.current.getVoices();
      const preferred =
        voices.find((v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Male') ||
            v.name.includes('David') ||
            v.name.includes('Google UK English Male') ||
            v.name.includes('Daniel') ||
            v.name.includes('Alex'))
        ) || voices.find((v) => v.lang.startsWith('en-')) || voices[0];
      if (preferred) utter.voice = preferred;
      utter.onstart = () => {
        setIsSpeaking(true);
        startKeepAlive();
      };
      utter.onend = () => {
        setIsSpeaking(false);
        stopKeepAlive();
        onEnd?.();
      };
      utter.onerror = (e) => {
        // 'interrupted' errors are expected when we cancel — ignore them
        if ((e as SpeechSynthesisErrorEvent).error === 'interrupted') return;
        setIsSpeaking(false);
        stopKeepAlive();
        onEnd?.();
      };
      setIsSpeaking(true);
      synthRef.current.speak(utter);
      // Chrome bug: kick resume after 150ms in case it starts paused
      setTimeout(() => {
        if (synthRef.current.paused) synthRef.current.resume();
      }, 150);
    };
    // Make sure voices are loaded before speaking
    if (voicesRef.current.length === 0) {
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        doSpeak();
      } else {
        const handler = () => {
          voicesRef.current = synthRef.current.getVoices();
          synthRef.current.removeEventListener('voiceschanged', handler);
          doSpeak();
        };
        synthRef.current.addEventListener('voiceschanged', handler);
        // Fallback: speak after 500ms even if voiceschanged never fires
        setTimeout(() => {
          synthRef.current.removeEventListener('voiceschanged', handler);
          doSpeak();
        }, 500);
      }
    } else {
      doSpeak();
    }
  }, [startKeepAlive, stopKeepAlive]);
  const cancelSpeech = useCallback(() => {
    synthRef.current.cancel();
    setIsSpeaking(false);
    stopKeepAlive();
  }, [stopKeepAlive]);
  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      synthRef.current.cancel();
      stopKeepAlive();
    };
  }, [stopKeepAlive]);
  return {
    transcript,
    state,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    isSpeaking,
    cancelSpeech,
    unlockAudio,
  };
}
