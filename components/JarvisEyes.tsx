import React, { useState, useEffect, useRef } from 'react';

interface JarvisEyesProps {
    onFrameCapture: (imageBase64: string) => void;
    onGestureCheck: (imageBase64: string) => void;
    onClose: () => void;
    lastGesture: string | null;
    arLabel: string;
}

const getGestureIcon = (gesture: string | null) => {
    switch(gesture) {
        case 'THUMBS_UP': return '👍';
        case 'VICTORY': return '✌️';
        case 'OPEN_PALM': return '🖐️';
        case 'CLOSED_FIST': return '✊';
        default: return '';
    }
}


const JarvisEyes: React.FC<JarvisEyesProps> = ({ onFrameCapture, onGestureCheck, onClose, lastGesture, arLabel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 370, y: 30 });
    const dragStartPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        let stream: MediaStream | null = null;
        let analysisIntervalId: NodeJS.Timeout | null = null;
        let gestureIntervalId: NodeJS.Timeout | null = null;

        const captureFrame = (): string | null => {
             if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const context = canvas.getContext('2d');
                if (context && video.videoWidth > 0 && video.videoHeight > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    return canvas.toDataURL('image/jpeg');
                }
            }
            return null;
        }

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Initial capture
                setTimeout(() => {
                     const dataUrl = captureFrame();
                     if (dataUrl) onFrameCapture(dataUrl);
                }, 1000);


                analysisIntervalId = setInterval(() => {
                    const dataUrl = captureFrame();
                    if (dataUrl) onFrameCapture(dataUrl);
                }, 10000);

                gestureIntervalId = setInterval(() => {
                     const dataUrl = captureFrame();
                    if (dataUrl) onGestureCheck(dataUrl);
                }, 3000);


            } catch (err) {
                console.error("Error accessing camera:", err);
                onClose();
            }
        };

        startCamera();

        return () => {
            if (analysisIntervalId) clearInterval(analysisIntervalId);
            if (gestureIntervalId) clearInterval(gestureIntervalId);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onFrameCapture, onGestureCheck, onClose]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y,
            });
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    return (
        <div
            ref={containerRef}
            className="fixed z-50 w-[350px] h-[250px] bg-black/70 backdrop-blur-md border-2 border-cyan-400 rounded-lg shadow-2xl neon-outline overflow-hidden"
            style={{ top: `${position.y}px`, left: `${position.x}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="w-full h-8 bg-gray-900/50 flex items-center justify-between px-3"
                onMouseDown={handleMouseDown}
            >
                <span className="text-cyan-400 font-orbitron text-sm">OMEGA VISION</span>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-40"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none space-y-4">
                <div className="w-20 h-20 border-2 border-cyan-400/50 rounded-full animate-pulse flex items-center justify-center p-1">
                    <div className="w-full h-full border-2 border-cyan-400/80 rounded-full"></div>
                </div>
                <p className="text-cyan-300 font-orbitron text-lg bg-black/60 px-4 py-2 rounded-lg shadow-lg neon-outline">
                    {arLabel}
                </p>
            </div>

            {lastGesture && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-cyan-300 px-4 py-2 rounded-lg text-lg font-orbitron z-20 animate-fade-in-out flex items-center space-x-2">
                    <span>{getGestureIcon(lastGesture)}</span>
                    <span>{lastGesture.replace('_', ' ')}</span>
                </div>
            )}
        </div>
    );
};

export default JarvisEyes;