'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { FAQ } from '@prisma/client';
import { createFAQ, updateFAQ, type FAQFormState } from './actions';

const FAQ_CATEGORIES = [
  'General',
  'Services',
  'Caregivers',
  'Getting Started',
  'Billing',
  'Privacy',
  'Quality',
];

interface FAQFormProps {
  faq?: FAQ;
}

export function FAQForm({ faq }: FAQFormProps) {
  const isEditing = !!faq;

  const boundAction = isEditing ? updateFAQ.bind(null, faq.id) : createFAQ;

  const [state, formAction, isPending] = useActionState<FAQFormState, FormData>(
    boundAction,
    { success: false }
  );

  return (
    <form action={formAction}>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              name="question"
              defaultValue={faq?.question}
              placeholder="e.g. What areas do you serve?"
              required
            />
            {state.errors?.question && (
              <p className="text-sm text-destructive">{state.errors.question[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              name="answer"
              defaultValue={faq?.answer}
              placeholder="Write the answer here..."
              rows={5}
              required
            />
            {state.errors?.answer && (
              <p className="text-sm text-destructive">{state.errors.answer[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={faq?.category || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {FAQ_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={faq?.sortOrder ?? 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isPublished">Status</Label>
              <Select
                name="isPublished"
                defaultValue={faq?.isPublished !== false ? 'true' : 'false'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild>
            <Link href="/admin/faqs">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                {isEditing ? 'Update' : 'Create'} FAQ
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
