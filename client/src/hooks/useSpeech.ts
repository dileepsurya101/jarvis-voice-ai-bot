import { useState, useRef, useCallback, useEffect } from 'react';
type SpeechState = 'idle' | 'listening' | 'error';
interface UseSpeechReturn {
  transcript: string;
  interimTranscript: string;
  state: SpeechState;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  isSpeaking: boolean;
  cancelSpeech: () => void;
  unlockAudio: () => void;
  onFinalTranscript: ((text: string) => void) | null;
  setOnFinalTranscript: (cb: ((text: string) => void) | null) => void;
}
export function useSpeech(): UseSpeechReturn {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [state, setState] = useState<SpeechState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const unlockedRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinalRef = useRef<((text: string) => void) | null>(null);
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const setOnFinalTranscript = useCallback((cb: ((text: string) => void) | null) => {
    onFinalRef.current = cb;
  }, []);
  // Load voices asynchronously
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
  // Chrome TTS keep-alive
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
  const unlockAudio = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    const utter = new SpeechSynthesisUtterance(' ');
    utter.volume = 0;
    utter.rate = 10;
    synthRef.current.speak(utter);
    synthRef.current.cancel();
  }, []);
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
    setInterimTranscript('');
  }, []);
  const startListening = useCallback(() => {
    if (!isSupported) return;
    // Stop any ongoing recognition first
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    unlockAudio();
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: typeof globalThis.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof globalThis.SpeechRecognition }).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setState('listening');
      setInterimTranscript('');
      setTranscript('');
    };
    recognition.onerror = (event) => {
      // network/no-speech errors - just go idle
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setState('error');
      } else {
        setState('idle');
      }
      setInterimTranscript('');
    };
    recognition.onend = () => {
      setState('idle');
      setInterimTranscript('');
    };
    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimTranscript(interim);
      if (finalText) {
        setTranscript(finalText.trim());
        setInterimTranscript('');
        // Auto-submit via callback when final result received
        if (onFinalRef.current) {
          onFinalRef.current(finalText.trim());
          // Stop listening after sending
          recognition.stop();
        }
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setState('idle');
    }
  }, [isSupported, unlockAudio]);
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    synthRef.current.cancel();
    stopKeepAlive();
    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.92;
      utter.pitch = 0.8;
      utter.volume = 1;
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
        if ((e as SpeechSynthesisErrorEvent).error === 'interrupted') return;
        setIsSpeaking(false);
        stopKeepAlive();
        onEnd?.();
      };
      setIsSpeaking(true);
      synthRef.current.speak(utter);
      setTimeout(() => {
        if (synthRef.current.paused) synthRef.current.resume();
      }, 150);
    };
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
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      synthRef.current.cancel();
      stopKeepAlive();
    };
  }, [stopKeepAlive]);
  return {
    transcript,
    interimTranscript,
    state,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    isSpeaking,
    cancelSpeech,
    unlockAudio,
    onFinalTranscript: onFinalRef.current,
    setOnFinalTranscript,
  };
}
