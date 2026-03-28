import { useState, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef(null);

    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        // Strip code blocks for speech
        const cleaned = text.replace(/```[\s\S]*?```/g, 'Code block provided.');

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
            (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.default)
        );
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

    return { isSpeaking, speak, stop };
}
