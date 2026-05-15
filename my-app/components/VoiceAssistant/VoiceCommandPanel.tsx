'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, X, WandSparkles } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { resolveVoiceCommand } from '@/lib/voiceCommands';

export default function VoiceCommandPanel() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Say things like "open mockups page".');

  const { error, interimTranscript, isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({
      continuous: true,
      interimResults: true,
      onFinalTranscript: (text) => {
        const command = resolveVoiceCommand(text);

        if (command.type === 'navigate' && command.path) {
          setStatusMessage(`Opening ${command.label}...`);
          setEnabled(false);
          stopListening();
          router.push(command.path);
          return;
        }

        setStatusMessage(`Heard: ${text}`);
      },
    });

  useEffect(() => {
    if (!enabled) {
      stopListening();
      return;
    }

    const started = startListening();
    if (!started) {
      setEnabled(false);
    }
  }, [enabled, startListening, stopListening]);

  useEffect(() => {
    if (error) {
      setStatusMessage(error);
      setEnabled(false);
    }
  }, [error]);

  if (!isSupported) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 rounded-full border border-[#f4978e]/30 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-2xl backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#f4978e] hover:text-[#f08080]"
        aria-label="Open voice assistant"
      >
        <WandSparkles className="h-4 w-4 text-[#f4978e]" />
        Voice Assistant
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[22rem] max-w-[calc(100vw-3rem)]">
      <div className="rounded-2xl border border-[#f4978e]/30 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${enabled ? 'bg-[#f4978e] text-white' : 'bg-[#fff1ee] text-[#f08080]'}`}>
              <WandSparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Voice Assistance</p>
              <p className="text-xs text-gray-500">Navigate by speaking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEnabled((current) => !current);
              if (enabled) {
                stopListening();
              }
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${enabled ? 'bg-[#f4978e] text-white hover:bg-[#f08080]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {enabled ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {enabled ? 'On' : 'Off'}
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <p className="font-medium text-gray-700">{statusMessage}</p>
          <p className="mt-1 text-gray-500">
            Try: open mockups page, go to home, open products page, open design studio.
          </p>
        </div>

        {(isListening || interimTranscript) && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#f4978e]/30 bg-[#fff7f6] px-3 py-2 text-xs text-gray-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f4978e] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#f4978e]" />
            </span>
            <span>{interimTranscript || 'Listening...'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setEnabled(false);
            setIsVisible(false);
          }}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
          Hide assistant
        </button>
      </div>
    </div>
  );
}
