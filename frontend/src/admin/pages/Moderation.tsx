import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, 
    Sparkles, 
    Play, 
    Trash2, 
    Check, 
    Users, 
    FileText, 
    MessageSquare, 
    AlertTriangle, 
    Activity, 
    RefreshCw,
    Star
} from 'lucide-react';
import api from '../services/adminApi';
import { useSocket } from '../context/AdminSocketContext';

export interface ModerationReport {
    _id: string;
    type: 'post' | 'comment' | 'user' | 'review';
    entityId: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    aiScore: number;
    flaggedContent: string;
    status: 'pending' | 'resolved_deleted' | 'resolved_approved';
    createdAt: string;
}

interface ScanProgress {
    stage: 'users' | 'posts' | 'comments' | 'reviews' | 'idle';
    current: number;
    total: number;
    percentage: number;
    message: string;
}

const Moderation: React.FC = () => {
    const { socket } = useSocket();
    const [reports, setReports] = useState<ModerationReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'post' | 'comment' | 'user' | 'review'>('post');
    const [scanning, setScanning] = useState<boolean>(false);
    const [progress, setProgress] = useState<ScanProgress>({
        stage: 'idle',
        current: 0,
        total: 0,
        percentage: 0,
        message: 'AI Moderation scan engine idle.'
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/moderation/ai/reports');
            if (res.data.success) {
                setReports(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load moderation reports', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Socket.io listeners for real-time progress broadcasts
    useEffect(() => {
        if (!socket) return;

        socket.on('moderation:progress', (data: ScanProgress) => {
            setScanning(true);
            setProgress(data);
        });

        socket.on('moderation:complete', (data: { success: boolean; message: string }) => {
            setScanning(false);
            setProgress({
                stage: 'idle',
                current: 0,
                total: 0,
                percentage: 100,
                message: data.message || 'Deep scan completed successfully!'
            });
            fetchReports();
        });

        return () => {
            socket.off('moderation:progress');
            socket.off('moderation:complete');
        };
    }, [socket]);

    const handleRunAnalysis = async () => {
        try {
            setScanning(true);
            setProgress({
                stage: 'users',
                current: 0,
                total: 0,
                percentage: 0,
                message: 'Initializing AI Deep Contextual Scanners...'
            });
            await api.post('/moderation/ai/run');
        } catch (err) {
            console.error('Failed to start deep scan', err);
            setScanning(false);
        }
    };

    const handleResolve = async (reportId: string, action: 'approve' | 'delete') => {
        try {
            const res = await api.post('/moderation/ai/resolve', { reportId, action });
            if (res.data.success) {
                setReports((prev) =>
                    prev.map((rep) =>
                        rep._id === reportId
                            ? { ...rep, status: action === 'approve' ? 'resolved_approved' : 'resolved_deleted' }
                            : rep
                    )
                );
            }
        } catch (err) {
            alert('Failed to resolve moderation report');
        }
    };

    const filteredReports = reports.filter(
        (r) => r.type === activeTab && r.status === 'pending'
    );

    const getSeverityStyles = (sev: 'low' | 'medium' | 'high') => {
        switch (sev) {
            case 'high':
                return 'bg-red-500/10 text-red-400 border border-red-500/30';
            case 'medium':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
            default:
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 pb-20 select-none font-mono"
        >
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                            AI Content <span className="text-red-500">Moderation</span> Shield
                        </h1>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Hybrid LLM & rule-based threat and content validation panel
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRunAnalysis}
                        disabled={scanning}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                            scanning
                                ? 'bg-red-950/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-[0.98]'
                        }`}
                    >
                        {scanning ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4 fill-white" />
                        )}
                        RUN DEEP CONTENT ANALYSIS
                    </button>
                </div>
            </div>

            {/* PROGRESS STREAM INDICATOR PANEL */}
            {(scanning || progress.percentage > 0) && (
                <div className="bg-[#0c0c0c]/90 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase text-gray-200 tracking-wider">
                                    AI Scanning Phase: {progress.stage.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold tracking-wide mt-0.5">
                                    {progress.message}
                                </span>
                            </div>
                        </div>
                        <span className="text-xl font-black text-white font-mono">{progress.percentage}%</span>
                    </div>

                    {/* Aesthetic Glow Progress bar */}
                    <div className="w-full h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden relative">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-500 to-amber-500 shadow-[0_0_10px_#ef4444]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            )}

            {/* TAB SELECTORS */}
            <div className="flex items-center border-b border-white/5 gap-2">
                {[
                    { key: 'post', label: 'FLAGGED POSTS', icon: FileText },
                    { key: 'comment', label: 'FLAGGED COMMENTS', icon: MessageSquare },
                    { key: 'review', label: 'FLAGGED REVIEWS', icon: Star },
                    { key: 'user', label: 'FLAGGED ACCOUNTS', icon: Users }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === tab.key
                                ? 'text-red-400 border-b-2 border-red-500 bg-red-500/[0.02]'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span className="ml-1.5 text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            {reports.filter((r) => r.type === tab.key && r.status === 'pending').length}
                        </span>
                    </button>
                ))}
            </div>

            {/* CONTENT GRID */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-red-500/55" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Retrieving audit data...</span>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#0c0c0c]/40 border border-white/5 rounded-3xl p-8 text-center max-w-xl mx-auto gap-4">
                    <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Check className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Ecosystem Completely Sanitized</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed max-w-sm">
                            Zero content nodes are currently flagged. The platform complies with community guidelines!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredReports.map((report) => (
                            <motion.div
                                key={report._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="bg-[#0c0c0c]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-red-500/30 transition-all shadow-[0_0_20px_transparent] hover:shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                            >
                                <div className="space-y-4">
                                    {/* Badge Headers */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${getSeverityStyles(report.severity)}`}>
                                                {report.severity} severity
                                            </span>
                                            <span className="text-[8px] font-black uppercase px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-full">
                                                AI Match: {(report.aiScore * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    </div>

                                    {/* Flagged Content Preview */}
                                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2 relative group overflow-hidden">
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest leading-none block">
                                            FLAGGED VALUE Preview:
                                        </span>
                                        <p className="text-xs text-gray-200 font-medium leading-relaxed font-sans max-h-[80px] overflow-y-auto custom-scrollbar">
                                            "{report.flaggedContent}"
                                        </p>
                                    </div>

                                    {/* AI Reasoning logs */}
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest block">
                                            CLASSIFIER REPORT REASONING:
                                        </span>
                                        <p className="text-[10px] text-red-400 font-bold leading-normal">
                                            {report.reason}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
                                    <button
                                        onClick={() => handleResolve(report._id, 'approve')}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-[#050505] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        Clear / Whitelist
                                    </button>
                                    <button
                                        onClick={() => handleResolve(report._id, 'delete')}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Purge Content
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default Moderation;
