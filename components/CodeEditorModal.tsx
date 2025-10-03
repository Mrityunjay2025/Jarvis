import React, { useState } from 'react';

interface CodeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (code: string, language: string) => void;
}

const LANGUAGES = ['javascript', 'python', 'shell', 'html', 'css', 'json', 'typescript'];

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (code.trim()) {
            onSubmit(code, language);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border-2 border-cyan-500/50 rounded-lg shadow-2xl w-full max-w-2xl neon-outline" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-orbitron text-cyan-400">Code Snippet Analysis</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label htmlFor="code-input" className="block text-sm font-medium text-gray-300 mb-2">Code</label>
                        <textarea
                            id="code-input"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={`// Paste your ${language} code here...`}
                            className="w-full h-64 bg-gray-900/50 border border-gray-700 rounded-lg p-3 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            spellCheck="false"
                        />
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-700/50">
                    <button
                        onClick={handleSubmit}
                        disabled={!code.trim()}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg transition-all duration-200 button-glow disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Submit for Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorModal;
