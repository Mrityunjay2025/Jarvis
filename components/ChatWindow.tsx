import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../types';
import { OmegaLogo, ThumbsUpIcon, ThumbsDownIcon, ChevronDownIcon, ClipboardIcon, CheckIcon } from '../constants';
import InteractiveChart from './InteractiveChart';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    onFeedback: (messageIndex: number, feedback: 'up' | 'down') => void;
}

// Helper component for syntax-highlighted code blocks with a copy button.
const CodeBlock: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        }, (err) => {
            console.error('Failed to copy code: ', err);
        });
    };

    return (
        <div className="relative group/code">
            <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={language}
                PreTag="div"
            >
                {codeString}
            </SyntaxHighlighter>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-gray-700/50 rounded-md text-gray-300 hover:bg-gray-600/70 opacity-0 group-hover/code:opacity-100 transition-all duration-200"
                aria-label="Copy code"
            >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onFeedback }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            // Show button if scrolled up more than a certain threshold (e.g., 100px)
            const isScrolledUp = container.scrollHeight - container.scrollTop > container.clientHeight + 100;
            setShowScrollButton(isScrolledUp);
        }
    };

    const isOmegaVisionMessage = (content: string) => content.startsWith('*[Ω Vision]*');

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative" ref={scrollContainerRef} onScroll={handleScroll}>
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0">
                           <OmegaLogo />
                        </div>
                    )}
                    <div className={`group relative max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
                        msg.role === 'user' 
                        ? 'bg-blue-800/30 backdrop-blur-sm text-gray-100 rounded-br-none neon-glow-accent' 
                        : 'bg-gray-800/30 backdrop-blur-sm text-gray-200 rounded-bl-none neon-outline'
                    }`}>
                        {msg.image && (
                            <img src={msg.image.src} alt="User attachment" className="rounded-lg mb-2 max-w-full h-auto" style={{maxHeight: '300px'}}/>
                        )}
                        {msg.code && (
                            <div className="mb-2">
                                <p className="text-xs text-gray-400 mb-1 font-semibold">{msg.code.language} snippet:</p>
                                <CodeBlock className={`language-${msg.code.language}`}>
                                    {msg.code.content}
                                </CodeBlock>
                            </div>
                        )}
                        {msg.content && (
                            <div className={`prose prose-invert prose-p:text-gray-200 prose-headings:text-cyan-400 prose-strong:text-white ${isOmegaVisionMessage(msg.content) ? 'text-cyan-300 italic' : ''}`}>
                                <ReactMarkdown
                                    components={{
                                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                                        code({ node, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return match ? (
                                                <CodeBlock className={className}>{children}</CodeBlock>
                                            ) : (
                                                <code className="text-amber-400 bg-gray-700/50 px-1 py-0.5 rounded" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        )}
                        {msg.chartData && (
                            <InteractiveChart chartData={msg.chartData} />
                        )}
                        {msg.role === 'model' && !msg.isTranscript && !isOmegaVisionMessage(msg.content) &&(
                             <div className="absolute -bottom-4 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={() => onFeedback(index, 'up')}
                                    disabled={!!msg.feedback || isLoading}
                                    className={`p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:cursor-not-allowed ${msg.feedback === 'up' ? 'text-cyan-400' : ''}`}
                                    aria-label="Good response"
                                >
                                    <ThumbsUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onFeedback(index, 'down')}
                                    disabled={!!msg.feedback || isLoading}
                                    className={`p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:cursor-not-allowed ${msg.feedback === 'down' ? 'text-red-400' : ''}`}
                                    aria-label="Bad response"
                                >
                                    <ThumbsDownIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && messages.length > 0 && (messages[messages.length - 1].role === 'user' || messages[messages.length-1].content.endsWith('...')) && (
                 <div className="flex items-start gap-4 justify-start">
                    <div className="flex-shrink-0">
                        <OmegaLogo />
                    </div>
                    <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-lg bg-gray-800/50 backdrop-blur-sm text-gray-200 rounded-bl-none neon-outline">
                       <div className="flex items-center space-x-2">
                           <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                           <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                           <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                       </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
             <button
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                className={`absolute bottom-6 right-6 bg-cyan-600/80 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-cyan-500 button-glow ${showScrollButton ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
                <ChevronDownIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ChatWindow;