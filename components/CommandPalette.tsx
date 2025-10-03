
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EyeIcon, MicrophoneIcon, StopIcon, PaperClipIcon, CodeIcon } from '../constants';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onExecuteCommand: (action: string) => void;
}

interface Command {
    name: string;
    action: string;
    icon: React.FC<{className?: string}>;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onExecuteCommand }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const COMMANDS: Command[] = [
        { name: 'Toggle Omega Vision', action: 'TOGGLE_VISION', icon: EyeIcon },
        { name: 'Start Voice Session', action: 'START_VOICE', icon: MicrophoneIcon },
        { name: 'Stop Voice Session', action: 'STOP_VOICE', icon: StopIcon },
        { name: 'Attach File', action: 'ATTACH_FILE', icon: PaperClipIcon },
        { name: 'Open Code Editor', action: 'OPEN_CODE_EDITOR', icon: CodeIcon },
        { name: 'Clear Chat History', action: 'CLEAR_CHAT', icon: () => <>&times;</> }, // Simple icon
        { name: 'Clear All Tasks', action: 'CLEAR_TASKS', icon: () => <>&times;</> },
    ];

    const filteredCommands = useMemo(() => {
        return COMMANDS.filter(cmd => cmd.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'Enter' && filteredCommands[activeIndex]) {
                e.preventDefault();
                onExecuteCommand(filteredCommands[activeIndex].action);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, filteredCommands, onExecuteCommand, onClose]);

    useEffect(() => {
        // Scroll active item into view
        const activeItem = listRef.current?.children[activeIndex] as HTMLLIElement;
        activeItem?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 pt-24" onClick={onClose}>
            <div 
                className="bg-gray-900/90 border-2 border-cyan-500/50 rounded-lg shadow-2xl w-full max-w-lg neon-outline flex flex-col" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Command Palette"
            >
                <div className="p-3 border-b border-gray-700/50">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent text-gray-200 font-sans placeholder-gray-500 text-lg focus:outline-none"
                    />
                </div>
                {filteredCommands.length > 0 ? (
                    <ul ref={listRef} className="max-h-80 overflow-y-auto p-2">
                        {filteredCommands.map((cmd, index) => (
                            <li
                                key={cmd.action}
                                onClick={() => onExecuteCommand(cmd.action)}
                                onMouseMove={() => setActiveIndex(index)}
                                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors duration-150 text-gray-300 ${
                                    activeIndex === index ? 'bg-cyan-600/50 text-white' : 'hover:bg-gray-700/50'
                                }`}
                                role="option"
                                aria-selected={activeIndex === index}
                            >
                                <cmd.icon className="w-5 h-5 mr-4 text-cyan-400" />
                                <span className="font-orbitron">{cmd.name}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center text-gray-500 font-orbitron">
                        No commands found.
                    </div>
                )}
                 <div className="p-2 text-xs text-gray-500 border-t border-gray-700/50 flex items-center justify-center space-x-4">
                    <span><kbd className="font-sans bg-gray-700 px-1.5 py-0.5 rounded">↑↓</kbd> to navigate</span>
                    <span><kbd className="font-sans bg-gray-700 px-1.5 py-0.5 rounded">↵</kbd> to select</span>
                    <span><kbd className="font-sans bg-gray-700 px-1.5 py-0.5 rounded">esc</kbd> to close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
