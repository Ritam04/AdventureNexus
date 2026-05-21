import React from 'react';
import { Users, UserCheck, FileText, Sparkles, MessageSquare, Heart, Users2, Activity } from 'lucide-react';
import { ObservabilityMetrics } from '../hooks/useAdminMetrics';

interface MetricsGridProps {
    metrics: ObservabilityMetrics;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
    const cards = [
        {
            title: 'ONLINE OPERATORS',
            value: (metrics.onlineUsersCount || 0).toLocaleString(),
            icon: Activity,
            color: 'text-emerald-400',
            glow: 'rgba(16, 185, 129, 0.25)',
            border: 'border-emerald-500/30 bg-emerald-500/[0.02]',
            pulse: true
        },
        {
            title: 'TOTAL ADVENTURERS',
            value: metrics.totalUsers.toLocaleString(),
            icon: Users,
            color: 'text-blue-400',
            glow: 'rgba(59, 130, 246, 0.15)',
            border: 'border-blue-500/20 bg-white/[0.01]',
            pulse: false
        },
        {
            title: 'ACTIVE PLAYERS (24H)',
            value: metrics.activeUsers.toLocaleString(),
            icon: UserCheck,
            color: 'text-teal-400',
            glow: 'rgba(20, 184, 166, 0.15)',
            border: 'border-teal-500/20 bg-white/[0.01]',
            pulse: false
        },
        {
            title: 'COMMUNITY POSTS (TODAY)',
            value: metrics.postsCreatedToday.toLocaleString(),
            icon: FileText,
            color: 'text-purple-400',
            glow: 'rgba(139, 92, 246, 0.15)',
            border: 'border-purple-500/20 bg-white/[0.01]',
            pulse: false
        },
        {
            title: 'EXPERIENCES (TODAY)',
            value: metrics.experiencesCreatedToday.toLocaleString(),
            icon: Sparkles,
            color: 'text-pink-400',
            glow: 'rgba(236, 72, 153, 0.15)',
            border: 'border-pink-500/20 bg-white/[0.01]',
            pulse: false
        },
        {
            title: 'TOTAL ENGAGEMENT (COMMENTS)',
            value: metrics.commentsCount.toLocaleString(),
            icon: MessageSquare,
            color: 'text-cyan-400',
            glow: 'rgba(6, 182, 212, 0.15)',
            border: 'border-cyan-500/20 bg-white/[0.01]',
            pulse: false
        },
        {
            title: 'TOTAL LIKES RECORDED',
            value: metrics.likesCount.toLocaleString(),
            icon: Heart,
            color: 'text-rose-400',
            glow: 'rgba(244, 63, 94, 0.15)',
            border: 'border-rose-500/20 bg-white/[0.01]',
            pulse: false
        },
        {
            title: 'GROUP MEMBERSHIPS',
            value: metrics.groupJoins.toLocaleString(),
            icon: Users2,
            color: 'text-amber-400',
            glow: 'rgba(245, 158, 11, 0.15)',
            border: 'border-amber-500/20 bg-white/[0.01]',
            pulse: false
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 font-mono select-none">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={`backdrop-blur-md border ${card.border} rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-[0_0_15px_transparent] hover:shadow-[0_0_20px_${card.glow}]`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black tracking-widest text-gray-500 uppercase leading-tight">{card.title}</span>
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl lg:text-2xl font-black text-white font-mono tracking-tight">
                            {card.value}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${card.pulse ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500/80'}`}></span>
                            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                                {card.pulse ? 'LIVE PIPELINE' : 'LIVE DATA'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MetricsGrid;
