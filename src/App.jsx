import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Sparkles, Brain, Zap, Send,
  Keyboard, Lightbulb, AlertCircle, Smartphone,
} from 'lucide-react';

import { queryGemini } from './services/gemini';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import ResponseDisplay from './components/ResponseDisplay';
import CompatibilityInfo from './components/CompatibilityInfo';
import KeywordSuggestions from './components/KeywordSuggestions';

// Rotating subtitle texts
const SUBTITLE_TEXTS = [
  'Your AI-Powered Assistant',
  'Voice & Text Commands',
  'Advanced Problem Solving',
  'Creative Content Generation',
  'Code Generation & Analysis',
];

const ERROR_MESSAGES = {
  'not-allowed': '🎤 Microphone access denied. Please allow microphone permission and try again.',
  'no-speech': '🔇 No speech detected. Please speak clearly and try again.',
  'network': '🌐 Network error. Please check your internet connection.',
  'audio-capture': '🎤 No microphone found. Please connect a microphone.',
  'service-not-allowed': '🚫 Speech service not available. Use Chrome with a stable connection.',
  'language-not-supported': '🌍 Language not supported.',
};

function App() {
  // --- State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [showKeywords, setShowKeywords] = useState(false);
  const [inputMode, setInputMode] = useState('text');
  const [textIndex, setTextIndex] = useState(0);

  const textInputRef = useRef(null);

  // --- Hooks ---
  const {
    isListening, speechSupported, isIOS, isMobile,
    startListening, stopListening, setOnResult, setOnError,
  } = useSpeechRecognition();

  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis();

  // --- Rotating subtitle ---
  useEffect(() => {
    const id = setInterval(() => setTextIndex((p) => (p + 1) % SUBTITLE_TEXTS.length), 3000);
    return () => clearInterval(id);
  }, []);

  // --- Default input mode ---
  useEffect(() => {
    if (speechSupported) setInputMode('voice');
  }, [speechSupported]);

  // --- Show suggestions when in text mode with no conversation ---
  useEffect(() => {
    setShowKeywords(inputMode === 'text' && !transcript && !response);
  }, [inputMode, transcript, response]);

  // --- Send to Gemini ---
  const sendToGemini = useCallback(async (message) => {
    setIsProcessing(true);
    setError('');
    setShowKeywords(false);

    try {
      const aiResponse = await queryGemini(message);
      setResponse(aiResponse);
      if (!isMobile || window.speechSynthesis) speak(aiResponse);
    } catch (err) {
      setError(`Failed to get response: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [isMobile, speak]);

  // --- Wire up speech recognition callbacks ---
  useEffect(() => {
    setOnResult((text) => {
      setTranscript(text);
      sendToGemini(text);
    });
    setOnError((errCode) => {
      setError(ERROR_MESSAGES[errCode] || `❌ Speech error: ${errCode}. Try again or use text mode.`);
    });
  }, [sendToGemini, setOnResult, setOnError]);

  // --- Handlers ---
  const handleMicClick = useCallback(async () => {
    if (!speechSupported) {
      setError('🚫 Speech recognition not supported. Please use text mode.');
      return;
    }
    if (isListening) {
      stopListening();
      return;
    }

    setResponse('');
    setTranscript('');
    setError('');
    setInputMode('voice');
    setShowKeywords(false);

    try {
      await startListening();
      setError('🎤 Listening... Speak now!');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('🔒 Microphone access denied. Enable it in browser settings and refresh.');
      } else if (err.name === 'NotFoundError') {
        setError('🎤 No microphone found. Connect one and try again.');
      } else {
        setError(`❌ Microphone error: ${err.message}. Try again or use text mode.`);
      }
    }
  }, [speechSupported, isListening, stopListening, startListening]);

  const handleTextSubmit = useCallback((e) => {
    e.preventDefault();
    const msg = textInput.trim();
    if (msg && !isProcessing) {
      setTranscript(msg);
      sendToGemini(msg);
      setTextInput('');
    }
  }, [textInput, isProcessing, sendToGemini]);

  const handleKeywordClick = useCallback((keyword) => {
    setTextInput(keyword);
    setInputMode('text');
    setShowKeywords(false);
    textInputRef.current?.focus();
  }, []);

  const toggleInputMode = useCallback(() => {
    if (!speechSupported && inputMode === 'text') {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    const next = inputMode === 'voice' ? 'text' : 'voice';
    setInputMode(next);
    setError('');
  }, [speechSupported, inputMode]);

  const clearConversation = useCallback(() => {
    setTranscript('');
    setResponse('');
    setTextInput('');
    setError('');
    stopSpeaking();
    if (isListening) stopListening();
  }, [stopSpeaking, isListening, stopListening]);

  // --- Derived ---
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);

  const voiceHelpText = isIOS
    ? 'Works best in Safari. Tap the button and speak clearly.'
    : isAndroid
      ? 'Ensure Chrome browser and microphone permission. Tap button and speak clearly.'
      : 'Click the button and speak clearly. Your browser will ask for microphone permission.';

  const statusConfig = isListening
    ? { text: 'Listening for your voice...', wrapper: 'bg-green-500/20 text-green-300 border border-green-500/30', dot: 'bg-green-400 animate-pulse' }
    : isProcessing
    ? { text: 'AI is thinking...', wrapper: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse' }
    : isSpeaking
    ? { text: 'AI is speaking...', wrapper: 'bg-red-500/20 text-red-300 border border-red-500/30', dot: 'bg-red-400 animate-pulse' }
    : inputMode === 'text'
    ? { text: 'Ready to type your message', wrapper: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', dot: 'bg-blue-400' }
    : speechSupported
    ? { text: 'Ready to chat', wrapper: 'bg-slate-800/50 text-slate-400 border border-slate-700/50', dot: 'bg-slate-500' }
    : { text: 'Text mode only', wrapper: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', dot: 'bg-orange-400' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse top-1/4 left-1/4" />
        <div className="absolute w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse bottom-1/4 right-1/4 delay-1000" />
        <div className="absolute w-32 h-32 sm:w-48 sm:h-48 bg-cyan-500 rounded-full opacity-10 blur-3xl animate-pulse top-3/4 left-1/2 delay-500" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.indigo.500/0.03)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.indigo.500/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center max-w-lg mx-auto mb-8">
        {/* Robot Logo */}
        <div className="mb-6 relative">
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full opacity-20 blur-xl animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30 blur-lg animate-pulse delay-500" />

            <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-slate-700">
              <div className="relative">
                {/* Robot head */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-2 relative shadow-lg">
                  <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-lg ${isListening ? 'bg-green-400 animate-pulse shadow-green-400/50'
                      : isProcessing ? 'bg-yellow-400 animate-pulse shadow-yellow-400/50'
                        : isSpeaking ? 'bg-red-400 animate-pulse shadow-red-400/50'
                          : 'bg-cyan-400 animate-pulse shadow-cyan-400/50'
                    }`} />
                  <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-2 h-2 sm:w-3 sm:h-3 rounded-full delay-300 shadow-lg ${isListening ? 'bg-green-400 animate-pulse shadow-green-400/50'
                      : isProcessing ? 'bg-yellow-400 animate-pulse shadow-yellow-400/50'
                        : isSpeaking ? 'bg-red-400 animate-pulse shadow-red-400/50'
                          : 'bg-cyan-400 animate-pulse shadow-cyan-400/50'
                    }`} />

                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1.5 sm:h-2 bg-slate-800 rounded-full">
                    <div className={`w-full h-full rounded-full animate-pulse ${isListening ? 'bg-gradient-to-r from-green-400 to-green-500'
                        : isProcessing ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : isSpeaking ? 'bg-gradient-to-r from-red-400 to-red-500'
                            : 'bg-gradient-to-r from-blue-400 to-purple-400'
                      }`} />
                  </div>

                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-t from-purple-500 to-cyan-400" />
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" />
                </div>

                {/* Robot body */}
                <div className="w-12 h-8 sm:w-16 sm:h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mx-auto relative">
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-4 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded opacity-80">
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white mx-auto mt-0.5 sm:mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mr-2 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Gemini AI
            </h1>
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 ml-2 animate-pulse delay-500" />
          </div>
          <div className="h-8 sm:h-10">
            <p className="text-lg sm:text-xl text-gray-300 font-light tracking-wide transition-all duration-1000 ease-in-out">
              {SUBTITLE_TEXTS[textIndex]}
            </p>
          </div>
          {isMobile && (
            <div className="flex items-center justify-center mt-2">
              <Smartphone className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-xs text-slate-400">Mobile Device Detected</span>
            </div>
          )}
        </div>

        {/* Compatibility Info */}
        <CompatibilityInfo speechSupported={speechSupported} isIOS={isIOS} />

        {/* Input Mode Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-full p-1 border border-slate-600/50">
            <button
              onClick={toggleInputMode}
              disabled={!speechSupported && inputMode === 'text'}
              className={`flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 ${inputMode === 'voice'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : speechSupported
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice
              {!speechSupported && <span className="ml-1 text-xs">(N/A)</span>}
            </button>
            <button
              onClick={toggleInputMode}
              className={`flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 ${inputMode === 'text'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Text
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {inputMode === 'voice' ? (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleMicClick}
                disabled={isProcessing || !speechSupported}
                className={`
                  group relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4
                  font-semibold text-sm sm:text-base rounded-full
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-2xl active:scale-95
                  focus:outline-none focus:ring-4 focus:ring-purple-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isListening
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse shadow-lg shadow-green-500/50'
                    : isProcessing
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white animate-pulse shadow-lg shadow-yellow-500/50'
                      : speechSupported
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-500/50'
                        : 'bg-slate-600 text-slate-300 cursor-not-allowed'
                  }
                `}
              >
                <span className="relative mr-2 sm:mr-3">
                  {isListening ? 'Listening...' : isProcessing ? 'Processing...' : speechSupported ? 'Start Voice Chat' : 'Voice Unavailable'}
                </span>
                <div className="relative">
                  {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-green-300 opacity-75 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-300 opacity-50 animate-ping delay-150" />
                    </>
                  )}
                </div>
              </button>

              {speechSupported && (
                <p className="text-xs text-slate-400 text-center max-w-sm">{voiceHelpText}</p>
              )}

              {(transcript || response) && (
                <button onClick={clearConversation} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-sm">
                  Clear Conversation
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="relative max-w-md mx-auto">
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={isProcessing}
                  className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-600/50 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeywords((p) => !p)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-full transition-all duration-300 text-sm border border-slate-600/30"
                >
                  <Lightbulb className="w-4 h-4 mr-2 inline" />
                  {showKeywords ? 'Hide' : 'Show'} Suggestions
                </button>
                {(transcript || response) && (
                  <button type="button" onClick={clearConversation} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-sm">
                    Clear Conversation
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Status indicator */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-300 ${statusConfig.wrapper}`}>
            <div className={`w-2 h-2 rounded-full mr-2 transition-all duration-300 ${statusConfig.dot}`} />
            {statusConfig.text}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keywords/Suggestions */}
      <div className="relative z-10">
        <KeywordSuggestions onKeywordClick={handleKeywordClick} visible={showKeywords} />
      </div>

      {/* Response Display */}
      <div className="relative z-10 flex-1 w-full">
        <ResponseDisplay transcript={transcript} response={response} isSpeaking={isSpeaking} onStopSpeaking={stopSpeaking} />
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-20 h-20 sm:w-40 sm:h-40 border border-purple-500/20 rounded-full opacity-40 animate-spin-slow" aria-hidden="true" />
      <div className="absolute -bottom-8 sm:-bottom-16 -right-8 sm:-right-16 w-16 h-16 sm:w-32 sm:h-32 border border-cyan-500/20 rounded-full opacity-40" style={{ animation: 'spin-slow 20s linear infinite reverse' }} aria-hidden="true" />

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        @media (max-width: 640px) { .prose p { font-size: 14px; line-height: 1.5; } }
        @media screen and (-webkit-min-device-pixel-ratio: 0) { input[type="text"] { font-size: 16px; } }
      `}</style>
    </div>
  );
}

export default App;