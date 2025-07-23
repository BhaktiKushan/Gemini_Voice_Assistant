import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Brain, Zap, Volume2, VolumeX, Copy, Check, Code, MessageSquare } from 'lucide-react';

// Code syntax highlighting component
const CodeBlock = ({ children, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const highlightCode = (code) => {
    // Simple syntax highlighting for common languages
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch', 'throw', 'new'];
    const strings = /("[^"]*"|'[^']*'|`[^`]*`)/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b\d+\.?\d*\b/g;
    
    let highlighted = code;
    
    // Highlight comments (do this first)
    highlighted = highlighted.replace(comments, '<span style="color: #6B7280; font-style: italic;">$1</span>');
    
    // Highlight strings
    highlighted = highlighted.replace(strings, '<span style="color: #10B981;">$1</span>');
    
    // Highlight numbers
    highlighted = highlighted.replace(numbers, '<span style="color: #F59E0B;">$&</span>');
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span style="color: #8B5CF6; font-weight: 600;">${keyword}</span>`);
    });
    
    return highlighted;
  };

  return (
    <div className="relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300 font-medium">{language}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-slate-200 font-mono leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(children) }} />
        </pre>
      </div>
    </div>
  );
};

// Response display component
const ResponseDisplay = ({ transcript, response, isSpeaking, onStopSpeaking }) => {
  const renderResponse = (text) => {
    if (!text) return null;

    // Split response into code blocks and regular text
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index).trim();
        if (beforeText) {
          parts.push({ type: 'text', content: beforeText });
        }
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push({ type: 'code', content: code, language });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim();
      if (remainingText) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    // If no code blocks found, treat as regular text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return <CodeBlock key={index} language={part.language}>{part.content}</CodeBlock>;
      } else {
        return (
          <div key={index} className="prose prose-invert max-w-none">
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{part.content}</p>
          </div>
        );
      }
    });
  };

  if (!transcript && !response) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* User Input */}
      {transcript && (
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-green-300 font-semibold text-lg">You said:</h3>
          </div>
          <p className="text-white text-base leading-relaxed pl-11">{transcript}</p>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-blue-300 font-semibold text-lg">Gemini AI:</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isSpeaking && (
                <>
                  <Volume2 className="w-5 h-5 text-red-400 animate-pulse" />
                  <button
                    onClick={onStopSpeaking}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="space-y-4 pl-11">
            {renderResponse(response)}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  const API_KEY = "AIzaSyBC7Sw3P7Z5R-z4L9-5VcvN8Zj2NEWD7OE";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  // Animated text effect
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Your AI-Powered Assistant",
    "Intelligent Conversations", 
    "Advanced Problem Solving",
    "Creative Content Generation",
    "Code Generation & Analysis"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setError('');
        setTranscript('');
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (finalTranscript.trim()) {
          setIsListening(false);
          sendToGemini(finalTranscript.trim());
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch(event.error) {
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone permission in your browser settings.');
            break;
          case 'no-speech':
            setError('No speech detected. Please try speaking again.');
            break;
          case 'network':
            setError('Network error. Please check your internet connection.');
            break;
          case 'audio-capture':
            setError('No microphone found. Please connect a microphone.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
      };
    } else {
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const sendToGemini = async (message) => {
    setIsProcessing(true);
    setError('');

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: message
          }]
        }]
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setResponse(aiResponse);
        
        // Add to conversation history
        setConversationHistory(prev => [...prev, 
          { type: 'user', content: message },
          { type: 'ai', content: aiResponse }
        ]);
        
        speakResponse(aiResponse);
      } else {
        throw new Error('Invalid response format from Gemini AI');
      }
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      setError(`Failed to get response: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Remove code blocks from speech
      const textToSpeak = text.replace(/```[\s\S]*?```/g, 'Code block provided.');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleMicClick = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setResponse('');
        setTranscript('');
        setError('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (permissionError) {
        setError('Microphone permission denied. Please allow microphone access and try again.');
        console.error('Microphone permission error:', permissionError);
      }
    }
  };

  const clearConversation = () => {
    setTranscript('');
    setResponse('');
    setConversationHistory([]);
    setError('');
    stopSpeaking();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse top-1/4 left-1/4"></div>
        <div className="absolute w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse bottom-1/4 right-1/4 delay-1000"></div>
        <div className="absolute w-32 h-32 sm:w-48 sm:h-48 bg-cyan-500 rounded-full opacity-10 blur-3xl animate-pulse top-3/4 left-1/2 delay-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.indigo.500/0.03)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.indigo.500/0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center max-w-lg mx-auto mb-8">
        {/* Robot Logo */}
        <div className="mb-6 relative">
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30 blur-lg animate-pulse delay-500"></div>
            
            <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-slate-700">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-2 relative shadow-lg">
                  <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-lg ${
                    isListening ? 'bg-green-400 animate-pulse shadow-green-400/50' : 
                    isProcessing ? 'bg-yellow-400 animate-pulse shadow-yellow-400/50' :
                    isSpeaking ? 'bg-red-400 animate-pulse shadow-red-400/50' :
                    'bg-cyan-400 animate-pulse shadow-cyan-400/50'
                  }`}></div>
                  <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-2 h-2 sm:w-3 sm:h-3 rounded-full delay-300 shadow-lg ${
                    isListening ? 'bg-green-400 animate-pulse shadow-green-400/50' : 
                    isProcessing ? 'bg-yellow-400 animate-pulse shadow-yellow-400/50' :
                    isSpeaking ? 'bg-red-400 animate-pulse shadow-red-400/50' :
                    'bg-cyan-400 animate-pulse shadow-cyan-400/50'
                  }`}></div>
                  
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1.5 sm:h-2 bg-slate-800 rounded-full">
                    <div className={`w-full h-full rounded-full animate-pulse ${
                      isListening ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      isProcessing ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      isSpeaking ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      'bg-gradient-to-r from-blue-400 to-purple-400'
                    }`}></div>
                  </div>
                  
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-t from-purple-500 to-cyan-400"></div>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50"></div>
                </div>
                
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
              {texts[textIndex]}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`
                group relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4
                font-semibold text-sm sm:text-base rounded-full 
                transform transition-all duration-300 
                hover:scale-105 hover:shadow-2xl
                active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isListening 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse shadow-lg shadow-green-500/50' 
                  : isProcessing 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white animate-pulse shadow-lg shadow-yellow-500/50'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-500/50'
                }
              `}
            >
              <span className="relative mr-2 sm:mr-3">
                {isListening ? 'Listening...' : 
                 isProcessing ? 'Processing...' : 
                 'Start Voice Chat'}
              </span>
              
              <div className="relative">
                {isListening ? (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-green-300 opacity-75 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-300 opacity-50 animate-ping delay-150"></div>
                  </>
                )}
              </div>
            </button>

            {(transcript || response) && (
              <button
                onClick={clearConversation}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status indicator */}
          <div className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm
            transition-all duration-300
            ${isListening 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : isProcessing 
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : isSpeaking
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full mr-2 transition-all duration-300
              ${isListening ? 'bg-green-400 animate-pulse' : 
                isProcessing ? 'bg-yellow-400 animate-pulse' :
                isSpeaking ? 'bg-red-400 animate-pulse' :
                'bg-slate-500'}
            `}></div>
            {isListening ? 'Listening for your voice...' : 
             isProcessing ? 'AI is thinking...' :
             isSpeaking ? 'AI is speaking...' :
             'Ready to chat'}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Response Display Component */}
      <div className="relative z-10 flex-1 w-full">
        <ResponseDisplay 
          transcript={transcript}
          response={response}
          isSpeaking={isSpeaking}
          onStopSpeaking={stopSpeaking}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-20 h-20 sm:w-40 sm:h-40 border border-purple-500/20 rounded-full opacity-40 animate-spin-slow"></div>
      <div className="absolute -bottom-8 sm:-bottom-16 -right-8 sm:-right-16 w-16 h-16 sm:w-32 sm:h-32 border border-cyan-500/20 rounded-full opacity-40" style={{animation: 'spin-slow 20s linear infinite reverse'}}></div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;