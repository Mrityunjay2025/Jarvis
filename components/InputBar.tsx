
import React from 'react';
import { SendIcon, MicrophoneIcon, LoadingSpinner, StopIcon, PaperClipIcon, DocumentTextIcon, CodeIcon } from '../constants';
import type { AttachedFile } from '../types';

interface InputBarProps {
    userInput: string;
    setUserInput: (value: string) => void;
    onSendMessage: () => void;
    isLoading: boolean;
    isRecording: boolean;
    onToggleRecording: () => void;
    onFileSelect: (file: File | null) => void;
    onRemoveAttachment: () => void;
    attachedFile: AttachedFile | null;
    onToggleCodeEditor: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: className },
        React.createElement('path', { d: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" })
    )
);

const InputBar: React.FC<InputBarProps> = ({ userInput, setUserInput, onSendMessage, isLoading, isRecording, onToggleRecording, onFileSelect, onRemoveAttachment, attachedFile, onToggleCodeEditor, fileInputRef }) => {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50">
            <div className="max-w-4xl mx-auto">
                {attachedFile && (
                    <div className="relative mb-2 w-fit bg-gray-800/50 p-2 rounded-lg">
                        {attachedFile.mimeType.startsWith('image/') ? (
                            <img src={attachedFile.src} alt="Attachment preview" className="h-20 w-auto rounded-md object-cover" />
                        ) : (
                             <div className="h-20 w-28 flex flex-col items-center justify-center bg-gray-700 rounded-md p-2">
                                <DocumentTextIcon className="w-8 h-8 text-cyan-400" />
                                <span className="text-xs text-gray-300 mt-1 truncate w-full text-center">{attachedFile.file.name}</span>
                            </div>
                        )}
                        <button 
                            onClick={onRemoveAttachment} 
                            className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-1 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Remove attachment"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="relative flex items-center">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening..." : "Message Jarvis... (or attach a file)"}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-4 pr-48 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
                        rows={1}
                        disabled={isLoading || isRecording}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        <input type="file" accept="image/*,.csv" ref={fileInputRef} onChange={(e) => {onFileSelect(e.target.files ? e.target.files[0] : null); e.target.value = '';}} className="hidden" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-full bg-gray-700 text-gray-300 transition-all duration-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed button-glow"
                            aria-label="Attach file"
                            disabled={isLoading || isRecording}
                        >
                            <PaperClipIcon className="w-5 h-5" />
                        </button>
                         <button 
                            onClick={onToggleCodeEditor}
                            className="p-2 rounded-full bg-gray-700 text-gray-300 transition-all duration-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed button-glow"
                            aria-label="Open code editor"
                            disabled={isLoading || isRecording}
                        >
                            <CodeIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onToggleRecording}
                            className={`p-2 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-500/80 text-white animate-pulse neon-glow-accent' : 'bg-gray-700 text-gray-300 button-glow'}`}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                            {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                        </button>
                        <button 
                            onClick={onSendMessage}
                            disabled={isLoading || (!userInput.trim() && !attachedFile)}
                            className="p-2 rounded-full bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 button-glow"
                            aria-label="Send message"
                        >
                            {isLoading ? <LoadingSpinner /> : <SendIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputBar;
