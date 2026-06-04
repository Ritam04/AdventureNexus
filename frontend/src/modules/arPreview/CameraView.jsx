import React, { useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

export default function CameraView({ active, onStreamInit, onError, permissionStatus, setPermissionStatus }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = async () => {
        stopCamera();
        setPermissionStatus('requesting');
        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Request rear camera if available
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(err => {
                        console.error('Error playing camera feed:', err);
                    });
                };
            }
            setPermissionStatus('granted');
            if (onStreamInit) {
                onStreamInit(videoRef.current);
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setPermissionStatus('denied');
            if (onError) {
                onError(err);
            }
        }
    };

    useEffect(() => {
        if (active) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [active]);

    if (!active) {
        return null;
    }

    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0 flex items-center justify-center">
            {permissionStatus === 'denied' ? (
                <div className="text-center p-6 space-y-4 max-w-sm relative z-10">
                    <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <CameraOff size={28} />
                    </div>
                    <h3 className="text-lg font-black text-white">Camera Access Denied</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        AdventureNexus requires camera permissions to render real-time AR overlays on your environment. Please enable camera access in your browser settings, or use the **Simulated Sandbox Mode** toggle.
                    </p>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {permissionStatus === 'requesting' && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 text-white">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Requesting Camera Access...</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
