import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const recognitionRef = useRef(null);
    const onResultRef = useRef(null);
    const onErrorRef = useRef(null);

    // Device detection — runs once
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        const mobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
        const android = /android/.test(ua);
        const chrome = /chrome/.test(ua) && !/edg/.test(ua);

        setIsIOS(ios);
        setIsMobile(mobile);

        let supported =
            'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

        if (android) {
            const secure = location.protocol === 'https:' || location.hostname === 'localhost';
            supported = supported && chrome && secure;
        }

        setSpeechSupported(supported);
    }, []);

    // Init recognition — runs when support changes
    useEffect(() => {
        if (!speechSupported) return;

        try {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SR();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                let text = '';
                for (let i = 0; i < event.results.length; i++) {
                    const r = event.results[i];
                    if (r.isFinal || r[0].confidence > 0.7) {
                        text += r[0].transcript;
                    }
                }
                if (text.trim()) {
                    setIsListening(false);
                    onResultRef.current?.(text.trim());
                }
            };

            recognition.onend = () => setIsListening(false);

            recognition.onerror = (event) => {
                setIsListening(false);
                if (event.error !== 'aborted') {
                    onErrorRef.current?.(event.error);
                }
            };

            recognitionRef.current = recognition;
        } catch {
            setSpeechSupported(false);
        }
    }, [speechSupported]);

    const startListening = useCallback(async () => {
        if (!recognitionRef.current) return;

        // Request mic permission
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        stream.getTracks().forEach((t) => t.stop());

        await new Promise((r) => setTimeout(r, 150));
        setIsListening(true);
        recognitionRef.current.start();
    }, []);

    const stopListening = useCallback(() => {
        try {
            recognitionRef.current?.stop();
        } catch { /* ignore */ }
        setIsListening(false);
    }, []);

    const setOnResult = useCallback((fn) => { onResultRef.current = fn; }, []);
    const setOnError = useCallback((fn) => { onErrorRef.current = fn; }, []);

    return {
        isListening,
        speechSupported,
        isIOS,
        isMobile,
        startListening,
        stopListening,
        setOnResult,
        setOnError,
    };
}
