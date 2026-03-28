import React, { useState, memo } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const KEYWORDS = [
    'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
    'return', 'import', 'export', 'class', 'extends', 'async', 'await',
    'try', 'catch', 'throw', 'new',
];

function highlightCode(code) {
    let h = code;
    h = h.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span style="color:#6B7280;font-style:italic">$1</span>');
    h = h.replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span style="color:#10B981">$1</span>');
    h = h.replace(/\b\d+\.?\d*\b/g, '<span style="color:#F59E0B">$&</span>');
    KEYWORDS.forEach((kw) => {
        h = h.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span style="color:#8B5CF6;font-weight:600">${kw}</span>`);
    });
    return h;
}

const CodeBlock = memo(function CodeBlock({ children, language = 'javascript' }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    return (
        <div className="relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300 font-medium">{language}</span>
                </div>
                <button
                    onClick={copy}
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
});

export default CodeBlock;
