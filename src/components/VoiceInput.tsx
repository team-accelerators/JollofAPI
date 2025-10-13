import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { useToast } from "./Toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  isListening?: boolean;
  onListeningChange?: (listening: boolean) => void;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceInput({
  onTranscript,
  placeholder = "Click the microphone to start speaking...",
  className = "",
  isListening: externalListening,
  onListeningChange,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  // Use external listening state if provided, otherwise use internal state
  const listening =
    externalListening !== undefined ? externalListening : isListening;

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setError(null);
        if (onListeningChange) {
          onListeningChange(true);
        } else {
          setIsListening(true);
        }
      };

      recognition.onend = () => {
        if (onListeningChange) {
          onListeningChange(false);
        } else {
          setIsListening(false);
        }
        setInterimTranscript("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimText = "";

        const resultKeys = Object.keys(event.results)
          .map(Number)
          .filter((i) => i >= event.resultIndex);
        for (const i of resultKeys) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalTranscript) {
          const newTranscript = transcript + finalTranscript;
          setTranscript(newTranscript);
          onTranscript(newTranscript);

          // Reset timeout when we get a final result
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Set a new timeout for automatic stop
          timeoutRef.current = setTimeout(() => {
            stopListening();
          }, 3000); // Stop after 3 seconds of silence
        }

        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(event.error);

        if (onListeningChange) {
          onListeningChange(false);
        } else {
          setIsListening(false);
        }

        switch (event.error) {
          case "no-speech":
            showToast("No speech detected. Please try again.", "error");
            break;
          case "audio-capture":
            showToast(
              "Microphone not accessible. Please check permissions.",
              "error"
            );
            break;
          case "not-allowed":
            showToast("Microphone permission denied.", "error");
            break;
          case "network":
            showToast(
              "Network error occurred. Please check your connection.",
              "error"
            );
            break;
          default:
            showToast("Speech recognition error. Please try again.", "error");
        }
      };
    } else {
      setIsSupported(false);
      setError("Speech recognition not supported in this browser");
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTranscript, onListeningChange, transcript, showToast]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      showToast("Speech recognition not supported", "error");
      return;
    }

    try {
      setTranscript("");
      setInterimTranscript("");
      setError(null);

      recognitionRef.current.start();

      // Set automatic stop timeout
      timeoutRef.current = setTimeout(() => {
        stopListening();
        showToast("Voice input stopped automatically", "info");
      }, 30000); // Stop after 30 seconds maximum
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      showToast("Failed to start voice input", "error");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    onTranscript("");
  };

  const currentText =
    transcript + (interimTranscript ? ` ${interimTranscript}` : "");

  if (!isSupported) {
    return (
      <div
        className={`bg-neutral-100 border-2 border-neutral-300 rounded-2xl p-6 shadow-soft neumorphic ${className}`}
      >
        <div className="flex items-center text-neutral-600">
          <svg
            className="w-6 h-6 mr-3 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-sm font-display font-medium">
            🚫 Voice input not supported in this browser
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Voice Input Display */}
      <div className="relative">
        <div
          className={`min-h-[80px] w-full px-6 py-4 rounded-2xl transition-all duration-300 ${
            listening
              ? "border-2 border-primary bg-primary/5 ring-2 ring-primary/20 shadow-medium neumorphic-inset"
              : "border-2 border-neutral-300 bg-white shadow-soft neumorphic"
          }`}
        >
          {currentText ? (
            <div className="text-neutral-700 font-display">
              <span className="text-neutral-800 font-medium">{transcript}</span>
              {interimTranscript && (
                <span className="text-neutral-500 italic font-normal">
                  {" "}
                  {interimTranscript}
                </span>
              )}
            </div>
          ) : (
            <div className="text-neutral-500 italic font-display">
              {listening ? "🎤 Listening... Speak now" : placeholder}
            </div>
          )}
        </div>

        {/* Clear button */}
        {currentText && (
          <button
            onClick={clearTranscript}
            className="absolute top-3 right-3 p-2 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 transition-all duration-200 shadow-soft"
            title="Clear transcript"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Microphone Button */}
        <Button
          onClick={toggleListening}
          variant={listening ? "secondary" : "outline"}
          className={`relative font-display font-medium ${
            listening
              ? "bg-secondary hover:bg-accent text-white animate-pulse border-secondary shadow-medium rounded-2xl"
              : "hover:bg-neutral-50 border-neutral-300 text-neutral-700 hover:text-primary hover:border-primary shadow-soft rounded-2xl"
          }`}
        >
          <svg
            className={`w-5 h-5 mr-2 ${
              listening ? "text-white" : "text-neutral-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {listening ? "🔴 Stop Recording" : "🎤 Start Recording"}

          {/* Listening indicator */}
          {listening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
          )}
        </Button>

        {/* Language Support Info */}
        <div className="flex items-center text-sm text-neutral-500 font-display">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>🇺🇸 English (US)</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center text-accent text-sm bg-accent/10 border-2 border-accent/20 rounded-2xl p-4 shadow-soft">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="font-display font-medium">{error}</span>
        </div>
      )}

      {/* Tips */}
      {!listening && !currentText && (
        <div className="text-sm text-neutral-600 bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-5 shadow-soft neumorphic">
          <div className="font-display font-semibold mb-3 text-primary flex items-center">
            <span className="mr-2">💡</span>
            Voice Input Tips
          </div>
          <ul className="space-y-2 font-display">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Speak clearly and at a normal pace</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Try saying "I want to cook Jollof rice with chicken"</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>
                Use natural language to describe ingredients or recipes
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>
                Recording stops automatically after 30 seconds or 3 seconds of
                silence
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
