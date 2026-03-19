'use client';

import { cn } from '@/lib/utils';
import type { MatchScore } from '@/app/actions/matching';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, History, Heart, Shield, BarChart3 } from 'lucide-react';

interface MatchScoreCardProps {
  match: MatchScore;
  rank: number;
}

const factorConfig = {
  skills: { label: 'Skills', icon: Star, color: 'text-amber-600' },
  proximity: { label: 'Location', icon: MapPin, color: 'text-blue-600' },
  availability: { label: 'Availability', icon: Clock, color: 'text-emerald-600' },
  history: { label: 'History', icon: History, color: 'text-purple-600' },
  preference: { label: 'Preferences', icon: Heart, color: 'text-rose-600' },
  compliance: { label: 'Compliance', icon: Shield, color: 'text-teal-600' },
  rating: { label: 'Rating', icon: BarChart3, color: 'text-orange-600' },
} as const;

function ScoreBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div
        className={cn('h-full rounded-full transition-all', className)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function MatchScoreCard({ match, rank }: MatchScoreCardProps) {
  const scoreColor =
    match.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    match.score >= 60 ? 'text-blue-600 dark:text-blue-400' :
    match.score >= 40 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400';

  const scoreBg =
    match.score >= 80 ? 'bg-emerald-500' :
    match.score >= 60 ? 'bg-blue-500' :
    match.score >= 40 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {rank}
            </span>
            <span className="font-semibold">{match.workerName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-2xl font-bold', scoreColor)}>{match.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Overall score bar */}
        <div className="mb-4">
          <ScoreBar value={match.score} className={scoreBg} />
        </div>

        {/* Factor breakdown */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
          {(Object.entries(match.factors) as [keyof typeof factorConfig, number][]).map(([key, value]) => {
            const config = factorConfig[key];
            const Icon = config.icon;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon className={cn('size-3', config.color)} />
                  <span>{config.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ScoreBar
                    value={value}
                    className={value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'}
                  />
                  <span className="w-6 text-right font-medium">{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MatchScoreList({ matches }: { matches: MatchScore[] }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No matching workers found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Worker Match Rankings</h3>
        <Badge variant="outline" className="text-xs">
          {matches.length} worker(s)
        </Badge>
      </div>
      {matches.map((match, i) => (
        <MatchScoreCard key={match.workerId} match={match} rank={i + 1} />
      ))}
    </div>
  );
}
