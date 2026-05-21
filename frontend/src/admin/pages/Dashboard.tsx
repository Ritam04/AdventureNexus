import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, RefreshCw, Play, Square, AreaChart as ChartIcon, Eye } from 'lucide-react';
import { useAdminMetrics } from '../hooks/useAdminMetrics';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import MetricsGrid from '../components/MetricsGrid';
import ChartCard from '../components/ChartCard';
import LiveActivityFeed from '../components/LiveActivityFeed';
import SystemHealthPanel from '../components/SystemHealthPanel';
import SystemLogsPanel from '../components/SystemLogsPanel';
import ToxicityRadar from '../components/ToxicityRadar';
import api from '../services/adminApi';

const Dashboard: React.FC = () => {
    const {
        metrics,
        timeSeries,
        systemHealth,
        loading: metricsLoading,
        error: metricsError,
        refresh: refreshMetrics
    } = useAdminMetrics();

    const {
        events,
        loading: eventsLoading,
        error: eventsError,
        refresh: refreshEvents
    } = useRealtimeEvents();

    const [simulatorActive, setSimulatorActive] = useState(false);
    const [simulatorLoading, setSimulatorLoading] = useState(false);

    useEffect(() => {
        const checkSimulatorStatus = async () => {
            try {
                const res = await api.get('/simulator/status');
                setSimulatorActive(res.data.data.active);
            } catch (err) {
                console.error('Failed to query simulator status', err);
            }
        };
        checkSimulatorStatus();
    }, []);

    const handleToggleSimulator = async () => {
        setSimulatorLoading(true);
        try {
            const res = await api.post('/simulator/toggle');
            setSimulatorActive(res.data.data.active);
            setTimeout(() => {
                refreshMetrics();
                refreshEvents();
            }, 1000);
        } catch (err) {
            alert('Failed to toggle traffic simulator');
        } finally {
            setSimulatorLoading(false);
        }
    };

    const handleManualRefresh = () => {
        refreshMetrics();
        refreshEvents();
    };

    if (metricsLoading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-white gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex flex-col items-center gap-1 font-mono">
                    <span className="text-xs font-black tracking-widest text-emerald-400 uppercase animate-pulse">Initializing Observability Tunnel...</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AdventureNexus Command Center</span>
                </div>
            </div>
        );
    }

    if (metricsError || eventsError) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-white gap-4 bg-red-950/15 border border-red-500/10 rounded-3xl p-8 max-w-lg mx-auto font-mono">
                <div className="p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                    <Shield className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black tracking-wider uppercase text-red-400">Observability Connection Failure</h3>
                <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed">
                    The admin client was unable to establish a secure stream with the AdventureNexus Core endpoints. Please ensure the backend is running.
                </p>
                <button
                    onClick={handleManualRefresh}
                    className="mt-2 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 pb-20 select-none font-sans"
        >
            {/* Header telemetry info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1.5 font-mono">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${simulatorActive ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                            Core Observability <span className="text-emerald-400 font-sans">Panel</span>
                        </h1>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Master node terminal session // live stream logs & system health
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Live Traffic Simulator controls */}
                    <button
                        onClick={handleToggleSimulator}
                        disabled={simulatorLoading}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-full text-[10px] font-bold transition-all uppercase tracking-widest font-mono ${
                            simulatorActive 
                            ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                            : 'border-white/10 text-gray-400 hover:text-white bg-white/[0.01] hover:bg-white/[0.03]'
                        }`}
                        title="Toggle synthetic mock operational traffic feed"
                    >
                        {simulatorActive ? <Square className="w-3 h-3 fill-indigo-400" /> : <Play className="w-3 h-3 fill-gray-400 hover:fill-white" />}
                        {simulatorActive ? 'STOP TRAFFIC SIMULATION' : 'START TRAFFIC SIMULATION'}
                    </button>

                    <button
                        onClick={handleManualRefresh}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 rounded-full text-[10px] font-bold text-gray-400 hover:text-white bg-white/[0.01] hover:bg-white/[0.03] transition-all uppercase tracking-widest font-mono"
                    >
                        <RefreshCw className="w-3 h-3" />
                        SYNC CORE SYSTEMS
                    </button>
                    <div className="hidden lg:flex items-center gap-2.5 bg-white/[0.01] border border-white/10 rounded-full px-4 py-2 font-mono text-[10px] font-bold text-emerald-400">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>SOCKET PIPELINE SYNCED</span>
                    </div>
                </div>
            </div>

            {/* TOP Grid: Live Metrics MetricsGrid */}
            {metrics && <MetricsGrid metrics={metrics} />}

            {/* GRAFANA PANEL TITLE */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 pt-4 font-mono">
                <ChartIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Ecosystem Metrics / Grafana Visualization Panels</span>
            </div>

            {/* 7 SEPARATE CHART PANELS (HIGH-DENSITY GRAFANA GRID) */}
            {timeSeries && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
                    {/* PANEL 1: User Registrations */}
                    <ChartCard
                        title="Operator Registration Ingestion"
                        subtitle="24h Ingestion Velocity"
                        type="area"
                        data={timeSeries.hourlyRegistrations}
                        dataKey="registrations"
                        xKey="hour"
                        color="#10b981"
                        glow="rgba(16, 185, 129, 0.4)"
                        gradientId="regGrad"
                    />

                    {/* PANEL 2: Community Posts */}
                    <ChartCard
                        title="Social Post Ingestion Rate"
                        subtitle="7-Day Feed Volume"
                        type="bar"
                        data={timeSeries.dailyPosts}
                        dataKey="count"
                        xKey="date"
                        color="#8b5cf6"
                        glow="rgba(139, 92, 246, 0.4)"
                        gradientId="postGrad"
                    />

                    {/* PANEL 3: Experiences Shared */}
                    <ChartCard
                        title="Shared Travel Experience Dispatches"
                        subtitle="7-Day Expeditions Volume"
                        type="line"
                        data={timeSeries.dailyExperiences}
                        dataKey="count"
                        xKey="date"
                        color="#ec4899"
                        glow="rgba(236, 72, 153, 0.4)"
                        gradientId="expGrad"
                    />

                    {/* PANEL 4: Comments Created */}
                    <ChartCard
                        title="Ecosystem Engagement (Comments)"
                        subtitle="7-Day Conversation Metrics"
                        type="line"
                        data={timeSeries.dailyComments}
                        dataKey="count"
                        xKey="date"
                        color="#06b6d4"
                        glow="rgba(6, 182, 212, 0.4)"
                        gradientId="commentGrad"
                    />

                    {/* PANEL 5: Likes/Reactions */}
                    <ChartCard
                        title="Reactions & Appraisals Tracked"
                        subtitle="7-Day Appreciation Density"
                        type="area"
                        data={timeSeries.dailyLikes}
                        dataKey="count"
                        xKey="date"
                        color="#f43f5e"
                        glow="rgba(244, 63, 94, 0.4)"
                        gradientId="likeGrad"
                    />

                    {/* PANEL 6: Group Membership Joins */}
                    <ChartCard
                        title="Nexus Group Join Ingestions"
                        subtitle="7-Day Memberships Activity"
                        type="bar"
                        data={timeSeries.dailyGroups}
                        dataKey="count"
                        xKey="date"
                        color="#f59e0b"
                        glow="rgba(245, 158, 11, 0.4)"
                        gradientId="groupGrad"
                    />

                    {/* PANEL 7: API Latency */}
                    <div className="md:col-span-2">
                        <ChartCard
                            title="Master Core Telemetry API Latency"
                            subtitle="Core Server Response Rates (ms)"
                            type="area"
                            data={timeSeries.apiLatency}
                            dataKey="value"
                            xKey="date"
                            color="#3b82f6"
                            glow="rgba(59, 130, 246, 0.4)"
                            gradientId="latencyGrad"
                        />
                    </div>
                </div>
            )}

            {/* MIDDLE Grid: Live Activity Feed Sidebar & Systems */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
                {/* Live Activity Logs Feed (2 Columns) */}
                <div className="lg:col-span-2">
                    <LiveActivityFeed events={events} loading={eventsLoading} />
                </div>

                {/* System health panel (1 Column) */}
                <div className="lg:col-span-1">
                    {systemHealth && <SystemHealthPanel health={systemHealth} />}
                </div>
            </div>

            {/* NEW ROW: Toxicity Moderation Shield Radar */}
            <div className="grid grid-cols-1 gap-6">
                <ToxicityRadar />
            </div>

            {/* BOTTOM Grid: Audit Log Trail */}
            <div className="grid grid-cols-1 gap-6 font-mono">
                <SystemLogsPanel />
            </div>
        </motion.div>
    );
};

export default Dashboard;
