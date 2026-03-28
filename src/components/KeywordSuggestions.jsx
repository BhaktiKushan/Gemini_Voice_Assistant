import React, { memo } from 'react';
import { Lightbulb } from 'lucide-react';

const SUGGESTIONS = [
    {
        category: 'Coding',
        items: [
            'Write a Python function for sorting',
            'Explain React hooks',
            'Create a REST API example',
            'Debug this JavaScript code',
            'Generate CSS animations',
        ],
    },
    {
        category: 'Creative',
        items: [
            'Write a short story about space',
            'Create a poem about nature',
            'Generate marketing copy',
            'Write a professional email',
            'Create a product description',
        ],
    },
    {
        category: 'Learning',
        items: [
            'Explain quantum physics simply',
            'Teach me about machine learning',
            'What is blockchain technology?',
            'How does photosynthesis work?',
            'Explain the history of AI',
        ],
    },
    {
        category: 'Business',
        items: [
            'Create a business plan outline',
            'Write SWOT analysis template',
            'Generate meeting agenda',
            'Draft project proposal',
            'Create performance metrics',
        ],
    },
];

const KeywordSuggestions = memo(function KeywordSuggestions({ onKeywordClick, visible }) {
    if (!visible) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-yellow-300 font-semibold">Suggested Prompts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUGGESTIONS.map((cat) => (
                    <div key={cat.category} className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">{cat.category}</h4>
                        <div className="space-y-2">
                            {cat.items.map((kw) => (
                                <button
                                    key={kw}
                                    onClick={() => onKeywordClick(kw)}
                                    className="w-full text-left px-3 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md border border-slate-600/30 hover:border-slate-500/50"
                                >
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default KeywordSuggestions;
