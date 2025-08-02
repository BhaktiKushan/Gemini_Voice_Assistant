import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Brain, Zap, Volume2, VolumeX, Copy, Check, Code, MessageSquare, Send, Keyboard, Lightbulb, AlertCircle, Smartphone } from 'lucide-react';

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
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch', 'throw', 'new'];
    const strings = /("[^"]*"|'[^']*'|`[^`]*`)/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b\d+\.?\d*\b/g;
    
    let highlighted = code;
    
    highlighted = highlighted.replace(comments, '<span style="color: #6B7280; font-style: italic;">$1</span>');
    highlighted = highlighted.replace(strings, '<span style="color: #10B981;">$1</span>');
    highlighted = highlighted.replace(numbers, '<span style="color: #F59E0B;">$&</span>');
    
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

// Compatibility Info Component
const CompatibilityInfo = ({ speechSupported, isIOS, isMobile }) => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

  if (speechSupported && !isIOS && !(isAndroid && !isChrome)) return null;

  return (
    <div className="w-full max-w-md mx-auto mb-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
      <div className="flex items-start space-x-2">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-yellow-300 text-sm font-medium mb-1">
            {isIOS 
              ? 'iOS Safari Required' 
              : isAndroid && !isChrome
              ? 'Chrome Required for Voice'
              : isAndroid && !isSecure
              ? 'HTTPS Required for Voice'
              : 'Voice Not Available'
            }
          </p>
          <p className="text-yellow-200 text-xs">
            {isIOS 
              ? 'Voice recognition works best in Safari on iOS devices. Please use Safari for voice features.'
              : isAndroid && !isChrome
              ? 'Voice recognition requires Google Chrome on Android. Please open this page in Chrome.'
              : isAndroid && !isSecure
              ? 'Voice recognition requires a secure connection (HTTPS). Please use a secure connection.'
              : 'Voice recognition is not supported in this browser. Please use text mode or switch to Chrome.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Keywords/Suggestions Component
const KeywordSuggestions = ({ onKeywordClick, visible }) => {
  const keywords = [
    { category: "Coding", items: [
      "Write a Python function for sorting",
      "Explain React hooks",
      "Create a REST API example",
      "Debug this JavaScript code",
      "Generate CSS animations"
    ]},
    { category: "Creative", items: [
      "Write a short story about space",
      "Create a poem about nature",
      "Generate marketing copy",
      "Write a professional email",
      "Create a product description"
    ]},
    { category: "Learning", items: [
      "Explain quantum physics simply",
      "Teach me about machine learning",
      "What is blockchain technology?",
      "How does photosynthesis work?",
      "Explain the history of AI"
    ]},
    { category: "Business", items: [
      "Create a business plan outline",
      "Write SWOT analysis template",
      "Generate meeting agenda",
      "Draft project proposal",
      "Create performance metrics"
    ]}
  ];

  if (!visible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="text-yellow-300 font-semibold">Suggested Prompts</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keywords.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">{category.category}</h4>
            <div className="space-y-2">
              {category.items.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => onKeywordClick(keyword)}
                  className="w-full text-left px-3 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md border border-slate-600/30 hover:border-slate-500/50"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [showKeywords, setShowKeywords] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // Default to text for better compatibility
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const textInputRef = useRef(null);

  const API_KEY = "AIzaSyBC7Sw3P7Z5R-z4L9-5VcvN8Zj2NEWD7OE";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  // Device detection
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);
    
    // Enhanced speech recognition detection for Android
    let speechRecognitionSupported = false;
    
    if ('webkitSpeechRecognition' in window) {
      speechRecognitionSupported = true;
    } else if ('SpeechRecognition' in window) {
      speechRecognitionSupported = true;
    }
    
    // Special handling for Android devices
    if (isAndroid) {
      // Android requires Chrome and secure context (HTTPS)
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      speechRecognitionSupported = speechRecognitionSupported && isChrome && isSecure;
      
      console.log('Android detection:', {
        isChrome,
        isSecure,
        speechSupported: speechRecognitionSupported,
        userAgent
      });
    }
    
    setSpeechSupported(speechRecognitionSupported);
    
    // Smart default mode selection
    if (isIOSDevice) {
      const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
      setInputMode(isSafari && speechRecognitionSupported ? 'voice' : 'text');
    } else if (isAndroid && speechRecognitionSupported) {
      // For Android with speech support, default to voice
      setInputMode('voice');
    } else if (speechRecognitionSupported) {
      // For other devices with speech support
      setInputMode('voice');
    } else {
      // Fallback to text mode
      setInputMode('text');
    }
  }, []);

  // Animated text effect
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Your AI-Powered Assistant",
    "Voice & Text Commands", 
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

  // Initialize speech recognition with better error handling
  useEffect(() => {
    if (!speechSupported) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Android-optimized configuration
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false; // Disabled for Android stability
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Android-specific settings
      if (/android/.test(navigator.userAgent.toLowerCase())) {
        recognitionRef.current.grammars = null; // Clear grammars for Android
        recognitionRef.current.serviceURI = null; // Use default service
      }

      recognitionRef.current.onstart = () => {
        setError('');
        setTranscript('');
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event) => {
        console.log('Speech recognition result:', event);
        
        let finalTranscript = '';
        
        // Process all results
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            // For Android, also use non-final results if they're confident enough
            if (result[0].confidence > 0.7) {
              finalTranscript += result[0].transcript;
            }
          }
        }

        if (finalTranscript.trim()) {
          setTranscript(finalTranscript.trim());
          setIsListening(false);
          sendToGemini(finalTranscript.trim());
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // Auto-restart if no transcript was captured (Android fix)
        if (!transcript && isListening) {
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Auto-restart failed:', e);
                setIsListening(false);
              }
            }
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event);
        setIsListening(false);
        
        switch(event.error) {
          case 'not-allowed':
            setError('🎤 Microphone access denied. Please allow microphone permission in Chrome settings and try again.');
            break;
          case 'no-speech':
            setError('🔇 No speech detected. Please speak clearly and try again.');
            break;
          case 'network':
            setError('🌐 Network error. Please check your internet connection and try again.');
            break;
          case 'audio-capture':
            setError('🎤 No microphone found. Please connect a microphone or check your device settings.');
            break;
          case 'service-not-allowed':
            setError('🚫 Speech service not available. Please ensure you\'re using Chrome and have a stable internet connection.');
            break;
          case 'aborted':
            // Don't show error for user-initiated stops
            console.log('Speech recognition aborted by user');
            break;
          case 'language-not-supported':
            setError('🌍 Language not supported. Trying with default language...');
            // Try again with a different language setting
            setTimeout(() => setError(''), 2000);
            break;
          default:
            setError(`❌ Speech error: ${event.error}. Please try again or use text mode.`);
        }
      };

      recognitionRef.current.onspeechstart = () => {
        console.log('Speech started');
        setError(''); // Clear any previous errors
      };

      recognitionRef.current.onspeechend = () => {
        console.log('Speech ended');
      };

      recognitionRef.current.onnomatch = () => {
        console.log('No speech match');
        setError('🤔 Could not understand. Please speak more clearly and try again.');
      };

    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setSpeechSupported(false);
      setInputMode('text');
      setError('❌ Speech recognition initialization failed. Using text mode.');
    }
  }, [speechSupported]);

  const sendToGemini = async (message) => {
    setIsProcessing(true);
    setError('');
    setShowKeywords(false);

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
        
        // Only speak on non-mobile or when explicitly requested
        if (!isMobile || window.speechSynthesis) {
          speakResponse(aiResponse);
        }
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
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      
      // Remove code blocks from speech
      const textToSpeak = text.replace(/```[\s\S]*?```/g, 'Code block provided.');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Better voice selection for different platforms
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak response:', error);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleMicClick = async () => {
    if (!speechSupported) {
      setError('🚫 Speech recognition not supported. Please use text mode.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    } else if (recognitionRef.current) {
      try {
        // Clear previous states
        setResponse('');
        setTranscript('');
        setError('');
        setInputMode('voice');
        setShowKeywords(false);

        // Request microphone permission explicitly for Android
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Stop the stream immediately (we just needed permission)
        stream.getTracks().forEach(track => track.stop());
        
        console.log('Microphone permission granted, starting recognition...');
        
        // Add a small delay for Android compatibility
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Set listening state before starting
        setIsListening(true);
        
        // Start recognition
        recognitionRef.current.start();
        
        console.log('Speech recognition started successfully');
        
        // Provide user feedback
        setError('🎤 Listening... Speak now!');
        setTimeout(() => {
          if (isListening) setError('');
        }, 2000);
        
      } catch (permissionError) {
        console.error('Microphone permission error:', permissionError);
        setIsListening(false);
        
        if (permissionError.name === 'NotAllowedError') {
          setError('🔒 Microphone access denied. Please enable microphone permission in your browser settings and refresh the page.');
        } else if (permissionError.name === 'NotFoundError') {
          setError('🎤 No microphone found. Please connect a microphone and try again.');
        } else if (permissionError.name === 'NotSupportedError') {
          setError('🚫 Microphone not supported on this device. Please use text mode.');
        } else {
          setError(`❌ Microphone error: ${permissionError.message}. Please try again or use text mode.`);
        }
      }
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing) {
      setTranscript(textInput.trim());
      sendToGemini(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeywordClick = (keyword) => {
    setTextInput(keyword);
    setInputMode('text');
    setShowKeywords(false);
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const toggleInputMode = () => {
    if (!speechSupported && inputMode === 'text') {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const newMode = inputMode === 'voice' ? 'text' : 'voice';
    setInputMode(newMode);
    setShowKeywords(newMode === 'text' && !transcript && !response);
    setError(''); // Clear any previous errors
  };

  const clearConversation = () => {
    setTranscript('');
    setResponse('');
    setTextInput('');
    setError('');
    setShowKeywords(inputMode === 'text');
    stopSpeaking();
    
    // Stop any ongoing recognition
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    setShowKeywords(inputMode === 'text' && !transcript && !response);
  }, [inputMode, transcript, response]);

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
          
          {/* Device indicator */}
          {isMobile && (
            <div className="flex items-center justify-center mt-2">
              <Smartphone className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-xs text-slate-400">Mobile Device Detected</span>
            </div>
          )}
        </div>

        {/* Compatibility Info */}
        <CompatibilityInfo 
          speechSupported={speechSupported}
          isIOS={isIOS}
          isMobile={isMobile}
        />

        {/* Input Mode Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-full p-1 border border-slate-600/50">
            <button
              onClick={toggleInputMode}
              disabled={!speechSupported && inputMode === 'text'}
              className={`flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                inputMode === 'voice' 
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
              className={`flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                inputMode === 'text' 
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
                  hover:scale-105 hover:shadow-2xl
                  active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300
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
                  {isListening ? 'Listening...' : 
                   isProcessing ? 'Processing...' : 
                   speechSupported ? 'Start Voice Chat' : 'Voice Unavailable'}
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

              {/* Voice help text */}
              {speechSupported && (
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  {isIOS 
                    ? 'Works best in Safari. Tap the button and speak clearly.' 
                    : /android/.test(navigator.userAgent.toLowerCase())
                    ? 'Ensure Chrome browser and microphone permission. Tap button and speak clearly after the beep.'
                    : 'Click the button and speak clearly. Your browser will ask for microphone permission.'
                  }
                </p>
              )}

              {(transcript || response) && (
                <button
                  onClick={clearConversation}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-sm"
                >
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
                  onClick={() => setShowKeywords(!showKeywords)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-full transition-all duration-300 text-sm border border-slate-600/30"
                >
                  <Lightbulb className="w-4 h-4 mr-2 inline" />
                  {showKeywords ? 'Hide' : 'Show'} Suggestions
                </button>
                
                {(transcript || response) && (
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-sm"
                  >
                    Clear Conversation
                  </button>
                )}
              </div>
            </form>
          )}

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
              : inputMode === 'text'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : speechSupported
              ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full mr-2 transition-all duration-300
              ${isListening ? 'bg-green-400 animate-pulse' : 
                isProcessing ? 'bg-yellow-400 animate-pulse' :
                isSpeaking ? 'bg-red-400 animate-pulse' :
                inputMode === 'text' ? 'bg-blue-400' :
                speechSupported ? 'bg-slate-500' : 'bg-orange-400'}
            `}></div>
            {isListening ? 'Listening for your voice...' : 
             isProcessing ? 'AI is thinking...' :
             isSpeaking ? 'AI is speaking...' :
             inputMode === 'text' ? 'Ready to type your message' :
             speechSupported ? 'Ready to chat' : 'Text mode only'}
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
        <KeywordSuggestions 
          onKeywordClick={handleKeywordClick}
          visible={showKeywords}
        />
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
        
        /* Mobile optimization */
        @media (max-width: 640px) {
          .prose p {
            font-size: 14px;
            line-height: 1.5;
          }
        }
        
        /* Prevent zoom on iOS when focusing inputs */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          input[type="text"] {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default App;