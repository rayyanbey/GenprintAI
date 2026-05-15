'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onFinalTranscript?: (text: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    onFinalTranscript,
  } = options;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const createRecognition = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition() as SpeechRecognition;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim() || '';

        if (!text) {
          continue;
        }

        if (result.isFinal) {
          finalChunk += `${text} `;
        } else {
          interimChunk += `${text} `;
        }
      }

      const nextFinal = `${finalTranscriptRef.current} ${finalChunk}`.trim();
      if (finalChunk.trim()) {
        finalTranscriptRef.current = nextFinal;
        setTranscript(nextFinal);
        onFinalTranscript?.(finalChunk.trim());
      }

      setInterimTranscript(interimChunk.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error || event.message || 'Speech recognition failed');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [continuous, interimResults, language, onFinalTranscript]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return false;
    }

    setError(null);
    resetTranscript();

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = createRecognition();
      }

      recognitionRef.current?.start();
      setIsListening(true);
      return true;
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Unable to start speech recognition');
      setIsListening(false);
      return false;
    }
  }, [createRecognition, isSupported, resetTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    error,
    interimTranscript,
    isListening,
    isSupported,
    resetTranscript,
    startListening,
    stopListening,
    transcript,
  };
}
