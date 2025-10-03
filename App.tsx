
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { SYSTEM_PROMPT } from './constants';
import type { Message, AttachedFile, Task } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import JarvisEyes from './components/JarvisEyes';
import ParticleBackground from './components/ParticleBackground';
import { createBlob, decode, decodeAudioData } from './services/audioUtils';
import { OmegaLogo } from './constants';
import CodeEditorModal from './components/CodeEditorModal';
import CommandPalette from './components/CommandPalette';


const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Jarvis online. All systems operational." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
    const [isEyesVisible, setIsEyesVisible] = useState(false);
    const [isVisuallyAnalyzing, setIsVisuallyAnalyzing] = useState(false);
    const [lastGesture, setLastGesture] = useState<string | null>(null);
    const [arLabel, setArLabel] = useState<string>('Initializing...');
    const [arTrackedObjects, setArTrackedObjects] = useState<string[]>([]);
    const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);


    const chatRef = useRef<Chat | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // --- Task Function Declarations ---
    const addTaskDeclaration: FunctionDeclaration = {
        name: 'addTask',
        parameters: {
            type: Type.OBJECT,
            description: 'Adds a new task to the user\'s to-do list.',
            properties: {
                description: { type: Type.STRING, description: 'The content of the task, e.g., "buy milk".' },
                priority: { type: Type.STRING, description: 'The priority of the task.', "enum": ["high", "medium", "low"] },
            },
            required: ['description'],
        },
    };
     const completeTaskDeclaration: FunctionDeclaration = {
        name: 'completeTask',
        parameters: {
            type: Type.OBJECT,
            description: 'Marks a task as completed based on its description.',
            properties: {
                description: { type: Type.STRING, description: 'The description of the task to mark as complete.' },
            },
            required: ['description'],
        },
    };
    const clearTasksDeclaration: FunctionDeclaration = {
        name: 'clearTasks',
        parameters: { type: Type.OBJECT, description: 'Clears all tasks from the list.', properties: {} },
    };
    const visionFunctionDeclarations = [
         { name: 'labelObject', parameters: { type: Type.OBJECT, description: 'Activates an AR label for a specific object seen by the camera.', properties: { objectName: { type: Type.STRING, description: 'The object to label, e.g., "microscope", "beaker".' } }, required: ['objectName'] } },
         { name: 'stopLabelingObject', parameters: { type: Type.OBJECT, description: 'Deactivates the AR label for a specific object.', properties: { objectName: { type: Type.STRING, description: 'The object to stop labeling.' } }, required: ['objectName'] } },
         { name: 'clearAllLabels', parameters: { type: Type.OBJECT, description: 'Deactivates all active AR labels.', properties: {} } }
    ];
    const allToolDeclarations = [addTaskDeclaration, completeTaskDeclaration, clearTasksDeclaration, ...visionFunctionDeclarations];


    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set.");
            setMessages(prev => [...prev, { role: 'model', content: "Error: API key is not configured. Please set the API_KEY environment variable." }]);
            return;
        }

        try {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } catch (error) {
            console.error("Failed to initialize GoogleGenAI client:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Error: Failed to initialize the AI service. Please check your API key." }]);
            return; 
        }

        try {
            chatRef.current = aiRef.current.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    tools: [{ functionDeclarations: allToolDeclarations }],
                },
            });
        } catch (error) {
            console.error("Failed to create chat session:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Error: Failed to create a chat session. The model may be configured incorrectly." }]);
        }
    }, []);
    
    useEffect(() => {
        if (lastGesture) {
            const timer = setTimeout(() => setLastGesture(null), 3000); // Clear gesture after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [lastGesture]);
    
     useEffect(() => {
        if (voiceCommandFeedback) {
            const timer = setTimeout(() => setVoiceCommandFeedback(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [voiceCommandFeedback]);
    
    // Command Palette Hotkey
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const handleClearCompletedTasks = () => {
        setTasks(tasks.filter(task => !task.completed));
    };

    const handleFileSelect = (file: File | null) => {
        if (!file) return;

        const SUPPORTED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const isSupportedImage = SUPPORTED_IMAGE_MIMETYPES.includes(file.type);
        const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

        if (isSupportedImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target?.result as string;
                setAttachedFile({ file, src, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        } else if (isCsv) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                // Ensure the mimeType is set correctly for CSVs
                setAttachedFile({ file, content, mimeType: 'text/csv' });
            };
            reader.readAsText(file);
        } else {
            console.error(`Unsupported file type attempted: ${file.type} (${file.name})`);
            setMessages(prev => [...prev, {
                role: 'model',
                content: "Error: Unsupported file type. I can only process images (JPEG, PNG, GIF, WEBP) and CSV files."
            }]);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachedFile(null);
    };

    const processFunctionCalls = (functionCalls: any[]) => {
        return functionCalls.map(fc => {
            let result = "ok";
            let uiMessage = '';
            switch(fc.name) {
                // Vision Calls
                case 'labelObject':
                    const objectToAdd = (fc.args.objectName as string).toLowerCase();
                    setArTrackedObjects(prev => [...new Set([...prev, objectToAdd])]);
                    uiMessage = `*[Ω Vision]* AR labeling for '${objectToAdd}' activated.`;
                    break;
                case 'stopLabelingObject':
                     const objectToRemove = (fc.args.objectName as string).toLowerCase();
                     setArTrackedObjects(prev => prev.filter(o => o !== objectToRemove));
                     uiMessage = `*[Ω Vision]* AR labeling for '${objectToRemove}' deactivated.`;
                     break;
                case 'clearAllLabels':
                    setArTrackedObjects([]);
                    uiMessage = `*[Ω Vision]* All AR labels deactivated.`;
                    break;
                // Task Calls
                case 'addTask':
                    const { description, priority = 'medium' } = fc.args;
                    setTasks(prev => [...prev, { id: Date.now(), text: description, priority, completed: false }]);
                    uiMessage = `*[Task Added]* New task: "${description}" (${priority} priority).`;
                    break;
                case 'completeTask':
                    const taskToComplete = (fc.args.description as string).toLowerCase();
                    let taskFound = false;
                    setTasks(prev => prev.map(t => {
                        if (t.text.toLowerCase().includes(taskToComplete) && !t.completed) {
                            taskFound = true;
                            return { ...t, completed: true };
                        }
                        return t;
                    }));
                    uiMessage = taskFound ? `*[Task Updated]* Marked task matching "${fc.args.description}" as complete.` : `*[Task Info]* No active task found matching "${fc.args.description}".`;
                    break;
                case 'clearTasks':
                    setTasks([]);
                    uiMessage = `*[Task Info]* All tasks have been cleared.`;
                    break;
            }
             if (uiMessage) {
                setMessages(prev => [...prev, { role: 'model', content: uiMessage }]);
            }

            return { id: fc.id, name: fc.name, response: { result } };
        });
    };
    
    const streamResponse = async (stream: AsyncGenerator<any>, isFollowUp: boolean = false) => {
        let modelResponseText = '';
        const functionCalls: any[] = [];
        
        if (!isFollowUp) {
            setMessages(prev => [...prev, { role: 'model', content: '...' }]);
        }

        for await (const chunk of stream) {
            if (chunk.text) {
                modelResponseText += chunk.text;
            }
             if (chunk.functionCalls) {
                functionCalls.push(...chunk.functionCalls);
            }
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = modelResponseText + '...';
                return newMessages;
            });
        }
        
        let finalContent = modelResponseText;
        let chartData = null;
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = modelResponseText.match(jsonRegex);

        if (match && match[1]) {
            try {
                const parsedJson = JSON.parse(match[1]);
                if (parsedJson.chartData) {
                    chartData = parsedJson.chartData;
                    finalContent = modelResponseText.replace(jsonRegex, '').trim();
                }
            } catch (e) {
                console.error("Failed to parse chart JSON from model response:", e);
            }
        }
        
         setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: finalContent,
                chartData: chartData || undefined,
            };
            return newMessages;
        });

        return { functionCalls, hasText: !!finalContent.trim() };
    }

    const handleSendMessage = useCallback(async (text: string, codePayload?: { language: string; content: string; }) => {
        // 1. Input Validation: Trim whitespace and ensure there's content to send.
        const messageText = text.trim();
        if (!messageText && !attachedFile && !codePayload) {
            console.warn("Attempted to send an empty message.");
            return; // Prevent sending empty messages
        }

        const newUserMessage: Message = {
            role: 'user',
            content: messageText,
            image: attachedFile?.mimeType.startsWith('image/') ? { src: attachedFile.src!, mimeType: attachedFile.mimeType } : undefined,
            code: codePayload,
        };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setUserInput('');
        setAttachedFile(null);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }
            
            let messageContent: any[] = [];
             if (attachedFile && attachedFile.mimeType === 'text/csv') {
                const csvPrompt = `...`; // Existing CSV prompt logic
                messageContent.push({ text: csvPrompt });
            } else if (codePayload) {
                 const codePrompt = `...`; // Existing Code prompt logic
                messageContent.push({ text: codePrompt });
            } else {
                if (messageText) messageContent.push({ text: messageText });
                if (attachedFile && attachedFile.mimeType.startsWith('image/')) {
                    messageContent.push({ inlineData: { data: attachedFile.src!.split(',')[1], mimeType: attachedFile.mimeType } });
                }
            }

            const stream = await chatRef.current.sendMessageStream({ message: messageContent });
            const { functionCalls, hasText } = await streamResponse(stream);

            if (functionCalls.length > 0) {
                const functionResponses = processFunctionCalls(functionCalls);
                
                // If the model only returned a function call without text, we might not need a follow-up.
                // But typically, we send the result back for a confirmation message.
                // FIX: Corrected the structure for sending tool/function responses.
                // The `message` parameter expects an array of `Part` objects. A tool response part
                // should have a `functionResponse` key.
                const followupStream = await chatRef.current.sendMessageStream({
                     message: functionResponses.map(fr => ({
                         functionResponse: { name: fr.name, response: fr.response }
                     }))
                });
                await streamResponse(followupStream, true);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = "My apologies, but I encountered an error. Please try again.";
            setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, attachedFile]);
    
     const handleCodeSubmit = (code: string, language: string) => {
        setIsCodeEditorOpen(false);
        handleSendMessage(userInput, { language, content: code });
    };

    const handleFeedback = useCallback(async (messageIndex: number, feedbackType: 'up' | 'down') => {
        setIsLoading(true);

        setMessages(prev => prev.map((msg, index) => 
            index === messageIndex ? { ...msg, feedback: feedbackType } : msg
        ));

        const modelResponse = messages[messageIndex];
        const userPrompt = messages[messageIndex - 1];

        if (!modelResponse || !userPrompt || userPrompt.role !== 'user') {
            setIsLoading(false);
            return;
        }

        const feedbackPrompt = `
[System: User Feedback Received]
The user provided feedback on my previous response.
Original User Prompt: "${userPrompt.content}"
My Response: "${modelResponse.content}"
User Feedback: ${feedbackType === 'up' ? 'Positive (Thumbs Up)' : 'Negative (Thumbs Down)'}.

${feedbackType === 'up' 
    ? "Action: Acknowledge the positive feedback briefly and ask how else you can assist." 
    : "Action: Apologize for the previous response not being helpful. Re-evaluate the original prompt and provide an improved, alternative response."
}
`;
        try {
             if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }
            const stream = await chatRef.current.sendMessageStream({ message: [{ text: feedbackPrompt }] });
            await streamResponse(stream);
        } catch (error) {
            console.error("Error sending feedback:", error);
            setMessages(prev => [...prev, { role: 'model', content: "I apologize, but I encountered an error processing your feedback." }]);
        } finally {
            setIsLoading(false);
        }

    }, [messages]);

    const handleFrameAnalysis = useCallback(async (imageBase64: string) => {
        if (isVisuallyAnalyzing || !aiRef.current) return;
        setIsVisuallyAnalyzing(true);
        setArLabel('Analyzing...');

        try {
            const imagePart = {
                inlineData: {
                    data: imageBase64.split(',')[1],
                    mimeType: 'image/jpeg',
                },
            };
            
            let textPrompt = "You are Jarvis, performing object recognition for an AR overlay. Identify the most prominent object in this image and respond with only its name (e.g., 'Coffee Mug', 'Laptop'). If no clear object is present, respond with '...'. Keep the response to three words maximum.";

            if (arTrackedObjects.length > 0) {
                textPrompt = `You are Jarvis, performing targeted object recognition. Your task is to identify if any of the following objects are in the image: '${arTrackedObjects.join(', ')}'. Respond with ONLY the name of the most prominent tracked object you see. If none of the tracked objects are visible, respond with '...'.`;
            }

            const textPart = { text: textPrompt };

            const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });

            const observation = response.text.trim();
            if (observation) {
                setArLabel(observation);
            }

        } catch (error) {
            console.error("Error analyzing frame:", error);
             setArLabel('Error');
        } finally {
            setTimeout(() => setIsVisuallyAnalyzing(false), 5000);
        }
    }, [isVisuallyAnalyzing, arTrackedObjects]);
    
    const stopVoiceSession = useCallback(async () => {
        setIsRecording(false);
        setMessages(prev => prev.filter(m => !m.isTranscript));

        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        if(scriptProcessorRef.current) {
             scriptProcessorRef.current.disconnect();
             scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            await outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
    }, []);

    const startVoiceSession = useCallback(async () => {
        setIsRecording(true);
        setMessages(prev => [...prev, { role: 'user', content: '*Listening...*', isTranscript: true}]);

        if (!process.env.API_KEY || !aiRef.current) {
                console.error("API_KEY environment variable not set or AI not initialized.");
                 setMessages(prev => [...prev, { role: 'model', content: "Error: API key is not configured for voice." }]);
                setIsRecording(false);
                return;
            }
        
        let nextStartTime = 0;
        const outputSources = new Set<AudioBufferSourceNode>();
        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        sessionPromiseRef.current = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                    microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const source = inputAudioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
                    scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        if (sessionPromiseRef.current) {
                            sessionPromiseRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
                    source.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.toolCall) {
                        const functionResponses = processFunctionCalls(message.toolCall.functionCalls);

                        if (functionResponses.length > 0) {
                            sessionPromiseRef.current?.then((session) => {
                                session.sendToolResponse({ functionResponses });
                            });
                        }
                    }

                    if (message.serverContent?.inputTranscription) {
                        let newText = message.serverContent.inputTranscription.text;
                        let updatedTranscription = currentInputTranscription + newText;
                        const lowerCaseTranscript = updatedTranscription.toLowerCase();
                        
                        const commands: { [key: string]: () => void } = {
                            'send message': () => { if (userInput.trim()) handleSendMessage(userInput); setVoiceCommandFeedback("Message sent"); },
                            'send it': () => { if (userInput.trim()) handleSendMessage(userInput); setVoiceCommandFeedback("Message sent"); },
                            'stop listening': () => { stopVoiceSession(); setVoiceCommandFeedback("Recording stopped"); },
                            'end recording': () => { stopVoiceSession(); setVoiceCommandFeedback("Recording stopped"); },
                            'attach file': () => { fileInputRef.current?.click(); setVoiceCommandFeedback("Opening file picker..."); },
                            'add file': () => { fileInputRef.current?.click(); setVoiceCommandFeedback("Opening file picker..."); },
                            'clear input': () => { setUserInput(''); setVoiceCommandFeedback("Input cleared"); },
                            'delete message': () => { setUserInput(''); setVoiceCommandFeedback("Input cleared"); },
                            'activate vision': () => { setIsEyesVisible(true); setVoiceCommandFeedback("Omega Vision activated"); },
                            'open eyes': () => { setIsEyesVisible(true); setVoiceCommandFeedback("Omega Vision activated"); },
                            'deactivate vision': () => { setIsEyesVisible(false); setVoiceCommandFeedback("Omega Vision deactivated"); },
                            'close eyes': () => { setIsEyesVisible(false); setVoiceCommandFeedback("Omega Vision deactivated"); },
                        };

                        let commandExecuted = false;
                        for (const phrase in commands) {
                            if (lowerCaseTranscript.endsWith(phrase)) {
                                commands[phrase]();
                                updatedTranscription = updatedTranscription.slice(0, -phrase.length);
                                commandExecuted = true;
                                break;
                            }
                        }

                        currentInputTranscription = updatedTranscription;
                        
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMsg = newMessages[newMessages.length - 1];
                            if (lastMsg?.role === 'user' && lastMsg.isTranscript) {
                                lastMsg.content = `*${currentInputTranscription}...*`;
                                return newMessages;
                            }
                            return prev;
                        });
                    }
                    
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const modelTranscriptIndex = newMessages.findIndex(m => m.role === 'model' && m.isTranscript);
                    
                            if (modelTranscriptIndex > -1) {
                                newMessages[modelTranscriptIndex].content = currentOutputTranscription + '...';
                            } else {
                                newMessages.push({ role: 'model', content: currentOutputTranscription + '...', isTranscript: true });
                            }
                            return newMessages;
                        });
                    }
                    
                    if (message.serverContent?.turnComplete) {
                        const finalInput = currentInputTranscription.trim();
                        const finalOutput = currentOutputTranscription.trim();
                    
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                    
                        setMessages(prev => {
                            const newMessages = prev.filter(m => !m.isTranscript);
                            if (finalInput) {
                                newMessages.push({ role: 'user', content: finalInput });
                            }
                            if (finalOutput) {
                                newMessages.push({ role: 'model', content: finalOutput });
                            }
                            newMessages.push({ role: 'user', content: '*Listening...*', isTranscript: true });
                            return newMessages;
                        });
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        source.addEventListener('ended', () => outputSources.delete(source));
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        outputSources.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Voice session error:", e);
                    setMessages(prev => [...prev.filter(m => !m.isTranscript), { role: 'model', content: "Sorry, there was a voice connection error." }]);
                    stopVoiceSession();
                },
                onclose: () => {},
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: SYSTEM_PROMPT,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{ functionDeclarations: allToolDeclarations }],
            },
        });
    }, [userInput, handleSendMessage, stopVoiceSession]);
    
    const handleToggleRecording = useCallback(() => {
        if (isRecording) {
            stopVoiceSession();
        } else {
            startVoiceSession();
        }
    }, [isRecording, startVoiceSession, stopVoiceSession]);
    
    const handleGestureCheck = useCallback(async (imageBase64: string) => {
        if (isVisuallyAnalyzing || !aiRef.current) return;
        setIsVisuallyAnalyzing(true);

        try {
            const imagePart = {
                inlineData: {
                    data: imageBase64.split(',')[1],
                    mimeType: 'image/jpeg',
                },
            };
            const textPart = { text: "Analyze the hand gesture in this image. Respond with ONLY one of the following keywords if you see a clear gesture: 'THUMBS_UP', 'VICTORY', 'OPEN_PALM', 'CLOSED_FIST'. If no clear gesture is detected, respond with 'NONE'." };
            
            const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            
            const gesture = response.text.trim();

            if (gesture && gesture !== 'NONE') {
                setLastGesture(gesture); 

                switch (gesture) {
                    case 'THUMBS_UP':
                        setMessages(prev => [...prev, { role: 'model', content: `*[Gesture: 👍]* Got it. Command acknowledged.` }]);
                        break;
                    case 'VICTORY':
                        setMessages(prev => [...prev, { role: 'model', content: `*[Gesture: ✌️]* Victory gesture detected. Analyzing surroundings in detail.` }]);
                        handleFrameAnalysis(imageBase64);
                        break;
                    case 'OPEN_PALM':
                        setMessages(prev => [...prev, { role: 'model', content: `*[Gesture: 🖐️]* Open palm detected. Disengaging visual sensors.` }]);
                        setIsEyesVisible(false);
                        break;
                    case 'CLOSED_FIST':
                         setMessages(prev => [...prev, { role: 'model', content: `*[Gesture: ✊]* Fist detected. ${isRecording ? 'Stopping' : 'Starting'} audio input.` }]);
                         handleToggleRecording();
                         break;
                }
            }
        } catch (error) {
            console.error("Error analyzing gesture:", error);
        } finally {
            setTimeout(() => setIsVisuallyAnalyzing(false), 2000); // Shorter cooldown for gestures
        }
    }, [isVisuallyAnalyzing, isRecording, handleToggleRecording, handleFrameAnalysis]);

    const handleExecuteCommand = (action: string) => {
        setIsCommandPaletteOpen(false);
        switch(action) {
            case 'TOGGLE_VISION':
                setIsEyesVisible(prev => !prev);
                break;
            case 'START_VOICE':
                if (!isRecording) handleToggleRecording();
                break;
            case 'STOP_VOICE':
                if (isRecording) handleToggleRecording();
                break;
            case 'ATTACH_FILE':
                fileInputRef.current?.click();
                break;
            case 'OPEN_CODE_EDITOR':
                setIsCodeEditorOpen(true);
                break;
            case 'CLEAR_CHAT':
                setMessages([{ role: 'model', content: "Jarvis online. All systems operational." }]);
                // Potentially reset chat history in the backend as well
                if(aiRef.current && chatRef.current) {
                     chatRef.current = aiRef.current.chats.create({
                        model: 'gemini-2.5-flash',
                        config: {
                            systemInstruction: SYSTEM_PROMPT,
                            tools: [{ functionDeclarations: allToolDeclarations }],
                        },
                    });
                }
                break;
            case 'CLEAR_TASKS':
                setTasks([]);
                break;
            default:
                console.warn(`Unknown command action: ${action}`);
        }
    }


    return (
        <div className="flex h-screen w-full bg-transparent text-gray-200 font-sans relative z-10">
            <ParticleBackground />
            <Sidebar 
                onToggleEyes={() => setIsEyesVisible(!isEyesVisible)} 
                isEyesEnabled={isEyesVisible}
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onClearCompleted={handleClearCompletedTasks}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
            <div className="flex flex-col flex-1 h-screen">
                <header className="flex items-center p-4 border-b border-gray-700/50 shadow-lg bg-gray-900/50 backdrop-blur-sm">
                    <OmegaLogo />
                    <h1 className="text-xl font-bold ml-3 text-cyan-400 tracking-wider font-orbitron">
                        Jarvis
                    </h1>
                </header>
                <ChatWindow messages={messages} isLoading={isLoading} onFeedback={handleFeedback} />
                 {voiceCommandFeedback && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md text-cyan-300 px-4 py-2 rounded-lg text-sm font-orbitron z-20 animate-fade-in-out border border-cyan-500/50">
                        {voiceCommandFeedback}
                    </div>
                )}
                <InputBar 
                    userInput={userInput}
                    setUserInput={setUserInput}
                    onSendMessage={() => handleSendMessage(userInput)}
                    isLoading={isLoading}
                    isRecording={isRecording}
                    onToggleRecording={handleToggleRecording}
                    onFileSelect={handleFileSelect}
                    onRemoveAttachment={handleRemoveAttachment}
                    attachedFile={attachedFile}
                    onToggleCodeEditor={() => setIsCodeEditorOpen(true)}
                    fileInputRef={fileInputRef}
                />
            </div>
            <CodeEditorModal 
                isOpen={isCodeEditorOpen} 
                onClose={() => setIsCodeEditorOpen(false)} 
                onSubmit={handleCodeSubmit} 
            />
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onExecuteCommand={handleExecuteCommand}
            />
             {isEyesVisible && <JarvisEyes onFrameCapture={handleFrameAnalysis} onGestureCheck={handleGestureCheck} lastGesture={lastGesture} onClose={() => setIsEyesVisible(false)} arLabel={arLabel} />}
        </div>
    );
};

export default App;
