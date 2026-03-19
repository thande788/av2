'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Send, Loader2 } from 'lucide-react';
import { requestTestimonial } from './actions';
import { toast } from 'sonner';

export function RequestTestimonialDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await requestTestimonial({
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      message: (formData.get('message') as string) || undefined,
    });

    setIsPending(false);

    if (result.success) {
      toast.success('Testimonial request sent successfully');
      setOpen(false);
    } else {
      toast.error(result.error || 'Failed to send request');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send className="size-4 mr-2" />
          Request Testimonial
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Testimonial</DialogTitle>
            <DialogDescription>
              Send an email to a past client requesting a testimonial about their
              experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="req-name">Recipient Name *</Label>
              <Input
                id="req-name"
                name="name"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-email">Recipient Email *</Label>
              <Input
                id="req-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-message">
                Custom Message (optional)
              </Label>
              <Textarea
                id="req-message"
                name="message"
                placeholder="Leave blank to use the default testimonial request template..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
