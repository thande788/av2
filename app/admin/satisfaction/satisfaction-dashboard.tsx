'use client';

import { cn } from '@/lib/utils';
import { Star, TrendingUp, ThumbsUp, MessageSquare, Clock, Heart, Users } from 'lucide-react';

interface Metrics {
  totalResponses: number;
  averageRating: number;
  averagePunctuality: number;
  averageCommunication: number;
  averageCareQuality: number;
  recommendRate: number;
  ratingDistribution: Record<number, number>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
}: {
  title: string;
  value: number | string;
  icon: typeof Star;
  suffix?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md border-primary/40 bg-primary/5 hover:bg-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">
            {value}
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 font-medium">{rating}</span>
      <Star className="size-3 fill-amber-400 text-amber-400" />
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

export function SatisfactionDashboard({ metrics }: { metrics: Metrics }) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Rating"
          value={metrics.averageRating || '—'}
          icon={Star}
          suffix="/5"
        />
        <StatCard
          title="Total Responses"
          value={metrics.totalResponses}
          icon={MessageSquare}
        />
        <StatCard
          title="Recommend Rate"
          value={metrics.recommendRate}
          icon={ThumbsUp}
          suffix="%"
        />
        <StatCard
          title="Care Quality"
          value={metrics.averageCareQuality || '—'}
          icon={Heart}
          suffix="/5"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rating distribution */}
        <div className="rounded-xl border border-border/50 p-5">
          <h3 className="mb-4 font-semibold">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingBar
                key={rating}
                rating={rating}
                count={metrics.ratingDistribution[rating] || 0}
                total={metrics.totalResponses}
              />
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border border-border/50 p-5">
          <h3 className="mb-4 font-semibold">Category Scores</h3>
          <div className="space-y-4">
            {[
              { label: 'Punctuality', value: metrics.averagePunctuality, icon: Clock },
              { label: 'Communication', value: metrics.averageCommunication, icon: Users },
              { label: 'Care Quality', value: metrics.averageCareQuality, icon: Heart },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <cat.icon className="size-4 text-muted-foreground" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="font-medium">
                    {cat.value > 0 ? `${cat.value}/5` : '—'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      cat.value >= 4 ? 'bg-emerald-500' :
                      cat.value >= 3 ? 'bg-amber-500' :
                      cat.value > 0 ? 'bg-red-500' : 'bg-muted'
                    )}
                    style={{ width: `${(cat.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {metrics.totalResponses === 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
          <TrendingUp className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No survey responses yet. Surveys will appear here after clients complete post-shift feedback forms.
          </p>
        </div>
      )}
    </div>
  );
}
