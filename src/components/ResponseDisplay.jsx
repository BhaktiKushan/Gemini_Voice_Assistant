import React, { memo, useMemo } from 'react';
import { Brain, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import CodeBlock from './CodeBlock';

const CODE_BLOCK_RE = /```(\w+)?\n?([\s\S]*?)```/g;

function parseResponse(text) {
    if (!text) return [];

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = CODE_BLOCK_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const before = text.slice(lastIndex, match.index).trim();
            if (before) parts.push({ type: 'text', content: before });
        }
        parts.push({ type: 'code', content: match[2].trim(), language: match[1] || 'text' });
        lastIndex = match.index + match[0].length;
    }
    // Reset regex lastIndex
    CODE_BLOCK_RE.lastIndex = 0;

    if (lastIndex < text.length) {
        const remaining = text.slice(lastIndex).trim();
        if (remaining) parts.push({ type: 'text', content: remaining });
    }

    return parts.length ? parts : [{ type: 'text', content: text }];
}

const ResponseDisplay = memo(function ResponseDisplay({ transcript, response, isSpeaking, onStopSpeaking }) {
    const responseParts = useMemo(() => parseResponse(response), [response]);

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
                        {isSpeaking && (
                            <div className="flex items-center space-x-2">
                                <Volume2 className="w-5 h-5 text-red-400 animate-pulse" />
                                <button
                                    onClick={onStopSpeaking}
                                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                                >
                                    <VolumeX className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 pl-11">
                        {responseParts.map((part, i) =>
                            part.type === 'code' ? (
                                <CodeBlock key={i} language={part.language}>{part.content}</CodeBlock>
                            ) : (
                                <div key={i} className="prose prose-invert max-w-none">
                                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{part.content}</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default ResponseDisplay;
