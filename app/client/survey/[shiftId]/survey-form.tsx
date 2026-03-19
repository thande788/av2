'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { submitSatisfactionSurvey } from '@/app/actions/satisfaction';
import { toast } from 'sonner';

interface SurveyFormProps {
  shiftId: string;
}

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="rounded-sm p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'size-7 transition-colors',
                (hovered || value) >= star
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function SurveyForm({ shiftId }: SurveyFormProps) {
  const [overall, setOverall] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [careQuality, setCareQuality] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (overall === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    startTransition(async () => {
      const result = await submitSatisfactionSurvey({
        shiftId,
        overallRating: overall,
        punctuality: punctuality || undefined,
        communication: communication || undefined,
        careQuality: careQuality || undefined,
        comment: comment.trim() || undefined,
        wouldRecommend: wouldRecommend ?? undefined,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error(result.error || 'Failed to submit');
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          Thank you for your feedback!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your response helps us improve our care services.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-border/50 bg-card p-6">
      {/* Overall rating */}
      <StarRating value={overall} onChange={setOverall} label="Overall Experience *" />

      {/* Sub-ratings */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StarRating value={punctuality} onChange={setPunctuality} label="Punctuality" />
        <StarRating value={communication} onChange={setCommunication} label="Communication" />
        <StarRating value={careQuality} onChange={setCareQuality} label="Care Quality" />
      </div>

      {/* Would recommend */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Would you recommend Angel Touch?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
              wouldRecommend === true
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-border text-muted-foreground hover:bg-muted'
            )}
          >
            <ThumbsUp className="size-4" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
              wouldRecommend === false
                ? 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400'
                : 'border-border text-muted-foreground hover:bg-muted'
            )}
          >
            <ThumbsDown className="size-4" />
            No
          </button>
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Additional Comments</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more about your experience..."
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || overall === 0}
        className="w-full"
      >
        <Send className="mr-2 size-4" />
        {isPending ? 'Submitting…' : 'Submit Feedback'}
      </Button>
    </div>
  );
}
