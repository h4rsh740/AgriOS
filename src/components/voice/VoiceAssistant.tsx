'use client';
// ============================================================
// AgriOS — Voice Assistant Component
// Bilingual Voice UI (Hindi / English) with STT & TTS
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Loader2, Globe } from 'lucide-react';
import { FarmContext } from '@/types';

// Web Speech API interface definitions
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface IWindow extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  SpeechRecognition?: new () => SpeechRecognitionInstance;
}

interface VoiceAssistantProps {
  ctx: FarmContext | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceAssistant({ ctx, isOpen, onClose }: VoiceAssistantProps) {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setError('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.results[0]?.[0]?.transcript || '';
          setTranscript(current);
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn('[Voice Recognition Error]', event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setError('Could not hear clearly. Please tap the microphone and try again.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudio();
    };
  }, [language]);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiResponse('');
      setError('');
      stopAudio();
      try {
        recognitionRef.current?.start();
      } catch {
        setError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      }
    }
  }

  async function handleAskQuestion() {
    if (!transcript.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ctx,
          question: transcript,
          language,
        }),
      });

      if (!res.ok) throw new Error('AI failed to respond');
      const data = await res.json();
      const answer = data.answer || data.summary || 'Advice received.';
      setAiResponse(answer);

      // Play audio response
      speakText(answer);
    } catch {
      setError('Could not reach the AI advisor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function speakText(text: string) {
    stopAudio();
    setIsPlayingAudio(true);

    try {
      // 1. Try Google Cloud TTS endpoint
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 400), // optimal utterance length
          languageCode: language === 'hi' ? 'hi-IN' : 'en-IN',
        }),
      });

      const data = await res.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackWebSpeech(text);
        await audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    fallbackWebSpeech(text);
  }

  function fallbackWebSpeech(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '560px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--agrios-green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="var(--agrios-green-700)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AgriOS Voice Assistant</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'hi' ? 'बोलकर कृषि सलाह प्राप्त करें' : 'Speak to your agricultural AI'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              title="Change Language"
            >
              <Globe size={13} /> {language === 'hi' ? 'हिंदी' : 'English'}
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Farm context reminder */}
        {ctx?.farm && (
          <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            🌾 Context: <strong>{ctx.farm.crop}</strong> ({ctx.farm.cropStage.replace('_', ' ')}) · {ctx.farm.location.state || 'India'}
          </div>
        )}

        {/* Microphone Pulse Area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
          <button
            onClick={toggleListening}
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              border: 'none',
              background: isListening ? 'var(--agrios-red-500)' : 'var(--agrios-green-600)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 0 12px rgba(239, 68, 68, 0.2)' : '0 10px 24px rgba(45, 155, 90, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            {isListening ? <MicOff size={36} /> : <Mic size={36} />}
          </button>
          <div style={{ marginTop: '14px', fontSize: '0.85rem', fontWeight: 600, color: isListening ? 'var(--agrios-red-600)' : 'var(--text-secondary)' }}>
            {isListening ? (language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') : (language === 'hi' ? 'माइक दबाएं और बोलें' : 'Tap mic and ask your question')}
          </div>
        </div>

        {/* Live Transcript */}
        {transcript && (
          <div style={{ background: 'var(--agrios-green-50)', border: '1px solid var(--agrios-green-200)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--agrios-green-700)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              {language === 'hi' ? 'आपका प्रश्न' : 'Your Question'}
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              &ldquo;{transcript}&rdquo;
            </div>
            {!isListening && (
              <button
                onClick={handleAskQuestion}
                disabled={isLoading}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '10px' }}
              >
                {isLoading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : 'Get Answer →'}
              </button>
            )}
          </div>
        )}

        {/* AI Answer Card */}
        {aiResponse && (
          <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '14px', borderLeft: '4px solid var(--agrios-green-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--agrios-green-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                AgriOS Advisor
              </div>
              <button
                onClick={() => isPlayingAudio ? stopAudio() : speakText(aiResponse)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.75rem', color: isPlayingAudio ? 'var(--agrios-green-700)' : 'var(--text-muted)' }}
              >
                {isPlayingAudio ? <><VolumeX size={14} /> Stop</> : <><Volume2 size={14} /> Listen</>}
              </button>
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {aiResponse}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--agrios-red-100)', border: '1px solid var(--agrios-red-400)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '0.8rem', color: 'var(--agrios-red-600)', marginBottom: '10px' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
