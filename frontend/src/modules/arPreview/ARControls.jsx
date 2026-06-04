import React from 'react';
import { 
    Maximize2, 
    RotateCw, 
    Eye, 
    RefreshCw, 
    Camera, 
    Compass, 
    Image, 
    Video 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ARControls({
    zoom,
    rotateY,
    opacity,
    onZoomChange,
    onRotateChange,
    onOpacityChange,
    onReset,
    isSimulatedMode,
    onToggleMode,
    onCapture,
    destinations,
    activeDest,
    onDestChange
}) {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-xl flex flex-col gap-4">
            
            {/* Top Row Selector: Landmarks Carousel */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x mask-fade">
                {Object.entries(destinations).map(([key, dest]) => {
                    const isActive = activeDest === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onDestChange(key)}
                            className={`snap-center shrink-0 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border backdrop-blur-xl flex items-center gap-1.5 ${
                                isActive
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-primary shadow-lg shadow-indigo-500/20 scale-[1.03]'
                                    : 'bg-card/45 text-muted-foreground border-white/5 hover:text-foreground hover:border-white/20'
                            }`}
                        >
                            <Compass size={12} className={isActive ? 'animate-spin' : ''} />
                            {dest.name}
                        </button>
                    );
                })}
            </div>

            {/* Main Interactive Control Dashboard Console */}
            <div className="bg-card/30 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
                
                {/* Sliders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Zoom Slider */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                            <span className="flex items-center gap-1"><Maximize2 size={10} /> Scale</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.2"
                            max="3.0"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Rotation Slider */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                            <span className="flex items-center gap-1"><RotateCw size={10} /> Rotation</span>
                            <span>{Math.round((rotateY * 180) / Math.PI)}°</span>
                        </div>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step="0.05"
                            value={rotateY}
                            onChange={(e) => onRotateChange(parseFloat(e.target.value))}
                            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                            <span className="flex items-center gap-1"><Eye size={10} /> Translucency</span>
                            <span>{Math.round(opacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={opacity}
                            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Lower Action buttons */}
                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                    {/* Reset Button */}
                    <Button
                        onClick={onReset}
                        className="h-10 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-white border border-white/5 flex items-center gap-1.5 shrink-0"
                    >
                        <RefreshCw size={12} /> Reset
                    </Button>

                    {/* Capture Snap Button */}
                    <Button
                        onClick={onCapture}
                        className="h-12 w-12 sm:w-auto sm:px-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-0 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-pink-500/25 shrink-0 transform active:scale-95 transition-transform"
                        title="Capture Photo"
                    >
                        <Camera size={18} />
                        <span className="hidden sm:inline">Capture Snap</span>
                    </Button>

                    {/* Mode Toggle Button */}
                    <button
                        onClick={onToggleMode}
                        className={`h-10 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-1.5 ${
                            isSimulatedMode
                                ? 'bg-primary/20 text-primary border-primary/30 shadow-inner'
                                : 'bg-white/5 text-muted-foreground border-white/5 hover:text-white hover:border-white/10'
                        }`}
                    >
                        {isSimulatedMode ? (
                            <>
                                <Image size={12} /> Sandbox Active
                            </>
                        ) : (
                            <>
                                <Video size={12} /> Live Camera
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
