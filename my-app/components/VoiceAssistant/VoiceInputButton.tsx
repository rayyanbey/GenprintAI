'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInputButton({ onTranscript, disabled = false, className = '' }: VoiceInputButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const { error, isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    continuous: false,
    interimResults: false,
    onFinalTranscript: (text) => {
      onTranscript(text);
      setIsActive(false);
    },
  });

  useEffect(() => {
    if (error) {
      setIsActive(false);
    }
  }, [error]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (isActive || isListening) {
          stopListening();
          setIsActive(false);
          return;
        }

        const started = startListening();
        setIsActive(started);
      }}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 transition-all ${isActive || isListening ? 'border-[#f4978e] bg-[#f4978e] text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-[#f4978e] hover:text-[#f4978e]'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
      aria-label={isActive || isListening ? 'Stop voice input' : 'Start voice input'}
      title={isActive || isListening ? 'Stop voice input' : 'Use voice to dictate your prompt'}
    >
      {isActive || isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
