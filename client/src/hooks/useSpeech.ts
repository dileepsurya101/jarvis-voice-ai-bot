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
}

export function useSpeech(): UseSpeechReturn {
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeechState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: typeof globalThis.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof globalThis.SpeechRecognition }).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setState('listening');
    recognition.onerror = () => setState('error');
    recognition.onend = () => setState('idle');
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 0.85;
    utter.volume = 1;

    // Prefer a deep English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Google') || v.name.includes('David'))
    );
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utter.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synthRef.current.speak(utter);
  }, []);

  const cancelSpeech = useCallback(() => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      synthRef.current.cancel();
    };
  }, []);

  return { transcript, state, isSupported, startListening, stopListening, resetTranscript, speak, isSpeaking, cancelSpeech };
}
