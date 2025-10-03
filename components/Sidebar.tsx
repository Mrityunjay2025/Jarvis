
import React from 'react';
import { JARVIS_CONFIG, EyeIcon, CommandIcon } from '../constants';
import type { Task } from '../types';
import TaskList from './TaskList';

interface SidebarProps {
    onToggleEyes: () => void;
    isEyesEnabled: boolean;
    tasks: Task[];
    onToggleTask: (id: number) => void;
    onClearCompleted: () => void;
    onOpenCommandPalette: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggleEyes, isEyesEnabled, tasks, onToggleTask, onClearCompleted, onOpenCommandPalette }) => {

    return (
        <aside className="hidden md:flex flex-col w-72 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 p-4 space-y-6">
            <div>
                 <h2 className="text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-4 font-orbitron">
                    Core Systems
                </h2>
                <div className="space-y-2">
                    <button 
                        onClick={onToggleEyes}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 button-glow ${isEyesEnabled ? 'bg-cyan-500/30 text-cyan-300' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                    >
                        <EyeIcon className="w-5 h-5 mr-3" />
                        <span className="flex-1">Omega Vision</span>
                         <span className={`w-3 h-3 rounded-full mr-3 ${isEyesEnabled ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-gray-600'}`}></span>
                    </button>
                    <button 
                        onClick={onOpenCommandPalette}
                        className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 button-glow bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                    >
                        <CommandIcon className="w-5 h-5 mr-3" />
                        <span className="flex-1">Command Palette</span>
                        <kbd className="font-sans text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-md border-b-2 border-gray-600">⌘K</kbd>
                    </button>
                </div>
            </div>
            
            <div className="border-t border-gray-700/50 pt-6">
                 <TaskList tasks={tasks} onToggleTask={onToggleTask} onClearCompleted={onClearCompleted} />
            </div>


             <div className="border-t border-gray-700/50 pt-6 mt-auto">
                <p className="text-xs text-gray-500 font-semibold">
                    {JARVIS_CONFIG.credits}
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
