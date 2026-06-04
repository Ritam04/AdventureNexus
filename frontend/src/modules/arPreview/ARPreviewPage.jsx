import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Compass, 
    Sparkles, 
    Brain, 
    ArrowLeft, 
    Camera, 
    X, 
    Download, 
    Share2, 
    AlertCircle,
    Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import CameraView from './CameraView';
import OverlayRenderer from './OverlayRenderer';
import ARControls from './ARControls';

const LOCAL_DESTINATIONS = {
    tajmahal: {
        name: "Taj Mahal",
        description: "An ivory-white marble mausoleum on the Yamuna river bank in Agra, India, built by Emperor Shah Jahan.",
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Align camera 15° upward. Position base along grid horizon. Shoot during sunrise for warm pink-glow highlights."
    },
    eiffeltower: {
        name: "Eiffel Tower",
        description: "A historic wrought-iron lattice tower on the Champ de Mars in Paris, France, named after Gustave Eiffel.",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1499856871958-5b9647a64bc8?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Angle up 30° from the Champ de Mars gardens. Keep tower centered to match architectural symmetry."
    },
    colosseum: {
        name: "Colosseum",
        description: "The largest ancient amphitheatre ever built, situated in Rome, Italy. An iconic symbol of imperial Roman architecture.",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1515542690876-879e0a35282b?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Align outer wall arches with the camera's rule-of-thirds grid. Frame from the East for soft golden afternoon light."
    },
    mountfuji: {
        name: "Mount Fuji",
        description: "An active stratovolcano located 100 kilometers southwest of Tokyo, Japan. Sacred site and national symbol of Japan.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Align volcano peak with the center vertical line. Target morning hours for clear skies and crisp snow-cap contrast."
    },
    greatwall: {
        name: "Great Wall of China",
        description: "A monumental series of ancient fortifications winding across northern China's ridges, built to protect historical borders.",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Tilt 10° along the slope of the steps. Keep the watchtower in the right third of your preview view."
    }
};

export default function ARPreviewPage() {
    const navigate = useNavigate();

    // Destination & loading states
    const [activeDestKey, setActiveDestKey] = useState('tajmahal');
    const [destData, setDestData] = useState(LOCAL_DESTINATIONS.tajmahal);
    const [isLoading, setIsLoading] = useState(false);

    // AR Parameter states
    const [zoom, setZoom] = useState(1.0);
    const [rotateY, setRotateY] = useState(0.0);
    const [opacity, setOpacity] = useState(0.85);
    const [offsetX, setOffsetX] = useState(0.0);
    const [offsetY, setOffsetY] = useState(-0.2);

    // Camera and Mode state
    const [isSimulatedMode, setIsSimulatedMode] = useState(true);
    const [permissionStatus, setPermissionStatus] = useState('idle');

    // Screenshot/Postcard modal states
    const [capturedImage, setCapturedImage] = useState(null);
    const [isPostcardOpen, setIsPostcardOpen] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    // Stream elements tracking
    const videoRefTracker = useRef(null);

    // Fetch destination assets from API or use local database fallback
    const fetchARAssets = async (destName) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/v1/ar/location?name=${destName}`);
            if (response.data && response.data.status === 'Success') {
                setDestData(response.data.data);
            } else {
                setDestData(LOCAL_DESTINATIONS[destName]);
            }
        } catch (error) {
            console.warn('API error loading AR assets, falling back to local dataset.', error);
            setDestData(LOCAL_DESTINATIONS[destName]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchARAssets(activeDestKey);
    }, [activeDestKey]);

    const handleReset = () => {
        setZoom(1.0);
        setRotateY(0.0);
        setOpacity(0.85);
        setOffsetX(0.0);
        setOffsetY(0.2);
        toast.success('Overlay positions reset!');
    };

    const handleDragMove = (deltaX, deltaY) => {
        setOffsetX((prev) => prev + deltaX);
        setOffsetY((prev) => prev + deltaY);
    };

    const handleCameraStreamInit = (videoElement) => {
        videoRefTracker.current = videoElement;
        setIsSimulatedMode(false); // Auto toggle to camera if granted
    };

    const handleCameraError = () => {
        setIsSimulatedMode(true); // Fallback to simulated sandbox mode if camera fails
        toast.error('Webcam access error. Defaulting to Simulated Sandbox mode.');
    };

    const handleToggleMode = () => {
        if (isSimulatedMode) {
            // Request camera enable
            setIsSimulatedMode(false);
            setPermissionStatus('idle');
        } else {
            // Turn off camera and use background backdrop
            setIsSimulatedMode(true);
            setPermissionStatus('idle');
        }
    };

    // Composite & Capture postcard screenshot function
    const handleCaptureSnapshot = () => {
        setIsCapturing(true);
        // Add artificial delay for camera shutter feedback
        setTimeout(async () => {
            try {
                const overlayCanvas = document.querySelector('canvas');
                if (!overlayCanvas) {
                    throw new Error("Overlay canvas not found");
                }

                const width = overlayCanvas.width;
                const height = overlayCanvas.height;

                // Create offscreen canvas for rendering composites
                const captureCanvas = document.createElement('canvas');
                captureCanvas.width = width;
                captureCanvas.height = height;
                const ctx = captureCanvas.getContext('2d');

                if (isSimulatedMode) {
                    // Draw simulated background image first
                    const bgImg = new Image();
                    bgImg.crossOrigin = "anonymous";
                    bgImg.src = destData.backgroundUrl;

                    await new Promise((resolve, reject) => {
                        bgImg.onload = () => {
                            // Cover fill algorithm
                            const imgAspect = bgImg.width / bgImg.height;
                            const canvasAspect = width / height;
                            let drawW, drawH, drawX, drawY;

                            if (imgAspect > canvasAspect) {
                                drawH = height;
                                drawW = height * imgAspect;
                                drawX = (width - drawW) / 2;
                                drawY = 0;
                            } else {
                                drawW = width;
                                drawH = width / imgAspect;
                                drawX = 0;
                                drawY = (height - drawH) / 2;
                            }

                            ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
                            resolve();
                        };
                        bgImg.onerror = () => {
                            // Neutral dark fallback backdrop if load fails
                            ctx.fillStyle = '#0f0f12';
                            ctx.fillRect(0, 0, width, height);
                            resolve();
                        };
                    });
                } else if (videoRefTracker.current) {
                    // Draw active camera video frame (flipped horizontally to match camera preview)
                    ctx.save();
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(videoRefTracker.current, 0, 0, width, height);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(0, 0, width, height);
                }

                // Draw the Three.js WebGL canvas layer
                ctx.drawImage(overlayCanvas, 0, 0, width, height);

                // Convert to dataUrl and update state
                const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(dataUrl);
                setIsPostcardOpen(true);
            } catch (err) {
                console.error("Capture snapshot failed:", err);
                toast.error("Failed to generate postcard snap");
            } finally {
                setIsCapturing(false);
            }
        }, 300);
    };

    return (
        <div className="relative w-screen h-screen bg-background text-white overflow-hidden select-none font-sans">
            
            {/* Top Back Nav Button & Title overlay */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 bg-card/40 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-full flex items-center justify-center text-white transition-all"
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="bg-card/45 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-2xl">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black block">AdventureNexus AR</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Sparkles size={11} className="text-primary animate-pulse" /> Travel Preview System
                    </span>
                </div>
            </div>

            {/* AI Advisor Panel (Floating Upper Right) */}
            <div className="absolute top-6 right-6 z-20 w-[90%] max-w-[280px] bg-card/30 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-4 shadow-xl hidden md:block">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                    <Brain size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">AI Overlay Alignment</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {destData.suggestedAngle}
                </p>
                <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-white/5 text-[9px] text-muted-foreground">
                    <Info size={10} />
                    <span>Drag overlay to move manually</span>
                </div>
            </div>

            {/* Immersive Background Render */}
            {isSimulatedMode ? (
                // Simulated Sandbox background photo
                <div className="absolute inset-0 w-full h-full z-0">
                    <img 
                        src={destData.backgroundUrl} 
                        alt="Simulated Backdrop" 
                        className="w-full h-full object-cover filter brightness-[0.6] saturate-[0.8] transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
                </div>
            ) : (
                // Real camera stream view
                <CameraView
                    active={!isSimulatedMode}
                    onStreamInit={handleCameraStreamInit}
                    onError={handleCameraError}
                    permissionStatus={permissionStatus}
                    setPermissionStatus={setPermissionStatus}
                />
            )}

            {/* Three.js Hologram Overlay Layer */}
            <OverlayRenderer
                imageUrl={destData.imageUrl}
                zoom={zoom}
                rotateY={rotateY}
                opacity={opacity}
                offsetX={offsetX}
                offsetY={offsetY}
                onDragMove={handleDragMove}
            />

            {/* Alignment Grid Overlay lines */}
            <div className="absolute inset-0 z-10 pointer-events-none border border-white/5 flex flex-col justify-between">
                <div className="h-[33.3%] w-full border-b border-white/5 border-dashed" />
                <div className="h-[33.3%] w-full border-b border-white/5 border-dashed" />
                <div className="absolute inset-y-0 left-[33.3%] w-px border-r border-white/5 border-dashed" />
                <div className="absolute inset-y-0 left-[66.6%] w-px border-r border-white/5 border-dashed" />
            </div>

            {/* Floating AR Controls HUD */}
            <ARControls
                zoom={zoom}
                rotateY={rotateY}
                opacity={opacity}
                onZoomChange={setZoom}
                onRotateChange={setRotateY}
                onOpacityChange={setOpacity}
                onReset={handleReset}
                isSimulatedMode={isSimulatedMode}
                onToggleMode={handleToggleMode}
                onCapture={handleCaptureSnapshot}
                destinations={LOCAL_DESTINATIONS}
                activeDest={activeDestKey}
                onDestChange={setActiveDestKey}
            />

            {/* Overlay loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-black">Loading destination...</span>
                    </div>
                </div>
            )}

            {/* Shutter Flash Animation during capture */}
            {isCapturing && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white z-50 pointer-events-none"
                />
            )}

            {/* Captured Postcard Modal overlay */}
            <AnimatePresence>
                {isPostcardOpen && capturedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPostcardOpen(false)}
                            className="absolute inset-0 bg-background/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-card border border-white/10 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 relative z-10 shadow-2xl space-y-6 overflow-hidden"
                        >
                            <button
                                onClick={() => setIsPostcardOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                                    <Camera size={18} className="text-primary animate-pulse" /> Capture Saved!
                                </h3>
                                <p className="text-xs text-muted-foreground">Download your AdventureNexus AR preview memory postcard.</p>
                            </div>

                            {/* Composite Image Preview */}
                            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 aspect-[4/3] bg-black">
                                <img src={capturedImage} alt="Postcard Capture" className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1.5">
                                    <Compass size={12} className="text-primary" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">{destData.name} Preview</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Download Button */}
                                <a
                                    href={capturedImage}
                                    download={`${destData.name.replace(/\s+/g, '_')}_AR_Preview.jpg`}
                                    className="py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
                                >
                                    <Download size={14} /> Download
                                </a>

                                {/* Share Mock Button */}
                                <button
                                    onClick={() => {
                                        toast.success("Postcard shared with the AdventureNexus community feed!");
                                        setIsPostcardOpen(false);
                                    }}
                                    className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                                >
                                    <Share2 size={14} /> Share Feed
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
