import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconStarFilled, IconCheck, IconClock } from '@tabler/icons-react';
import { getCurrentPortalUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn, formatDateUS } from '@/lib/utils';
import { TestimonialForm } from '@/components/client/testimonial-form';

export const metadata = {
  title: 'Testimonials',
  description: 'Share your experience with Angel Touch Homecare',
};

export default async function ClientTestimonialsPage() {
  const portalUser = await getCurrentPortalUser();

  if (!portalUser) {
    redirect('/client');
  }

  // Fetch testimonials submitted by this user
  const myTestimonials = await db.testimonial.findMany({
    where: {
      submittedById: portalUser.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
        <p className="text-muted-foreground">
          Share your experience with Angel Touch Homecare
        </p>
      </div>

      {/* Write a Testimonial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPencil className="size-5" />
            Write a Testimonial
          </CardTitle>
          <CardDescription>
            Tell us about your overall experience. With your permission, your
            words may be featured on our website to help other families.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialForm />
        </CardContent>
      </Card>

      {/* Past Testimonials */}
      {myTestimonials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Testimonials</CardTitle>
            <CardDescription>
              Testimonials you&apos;ve submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTestimonials.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    'relative overflow-hidden rounded-xl border p-4',
                    'border-border/50 bg-card'
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <IconStarFilled
                            key={i}
                            className={cn(
                              'size-4',
                              i < (t.rating ?? 0) ? 'text-amber-400' : 'text-muted-foreground/20'
                            )}
                          />
                        ))}
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          t.isPublished
                            ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {t.isPublished ? (
                          <><IconCheck className="mr-1 size-3" /> Published</>
                        ) : (
                          <><IconClock className="mr-1 size-3" /> Pending Review</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDateUS(t.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
