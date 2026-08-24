'use client';

import { useState, useTransition } from 'react';
import { IconChevronDown, IconChevronRight, IconLoader2, IconTrash } from '@tabler/icons-react';
import { addCurrentClientCareRecipient, removeCurrentClientCareRecipient } from '@/app/actions/care-recipients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CareRecipientItem {
  id: string;
  fullName: string;
  relationship: string | null;
  dateOfBirth: string | null;
  isPrimary: boolean;
}

export function CareRecipientsManager({
  clientType,
  careRecipients,
}: {
  clientType: 'SELF' | 'FAMILY' | 'FACILITY';
  careRecipients: CareRecipientItem[];
}) {
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAddMore = clientType !== 'SELF' || careRecipients.length === 0;
  const showRelationshipField = clientType === 'FAMILY';

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      try {
        await addCurrentClientCareRecipient({
          fullName,
          relationship: showRelationshipField ? relationship || null : null,
          dateOfBirth: dateOfBirth || null,
        });
        setFullName('');
        setRelationship('');
        setDateOfBirth('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to add care recipient.');
      }
    });
  };

  const handleRemove = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await removeCurrentClientCareRecipient(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to remove care recipient.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Add Care Recipient</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddOpen((open) => !open)}
              aria-expanded={isAddOpen}
              aria-controls="add-care-recipient-panel"
            >
              {isAddOpen ? (
                <>
                  Collapse
                  <IconChevronDown className="ml-1 size-4" />
                </>
              ) : (
                <>
                  Expand
                  <IconChevronRight className="ml-1 size-4" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isAddOpen && (
        <CardContent id="add-care-recipient-panel" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="recipient-name">Full Name</Label>
              <Input
                id="recipient-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Recipient full name"
                disabled={!canAddMore || isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-dob">Date of Birth</Label>
              <Input
                id="recipient-dob"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                disabled={!canAddMore || isPending}
              />
            </div>
          </div>
          {showRelationshipField && (
            <div className="space-y-2">
              <Label htmlFor="recipient-relationship">Relationship</Label>
              <Input
                id="recipient-relationship"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                placeholder="Relationship to account holder"
                disabled={!canAddMore || isPending}
              />
            </div>
          )}
          <Button
            onClick={handleAdd}
            disabled={!canAddMore || !fullName.trim() || isPending}
          >
            {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            Add Recipient
          </Button>
          {!canAddMore && (
            <p className="text-sm text-muted-foreground">
              Self accounts can only have one care recipient.
            </p>
          )}
        </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Care Recipients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {careRecipients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No care recipients found.</p>
          ) : (
            careRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{recipient.fullName}</p>
                    {recipient.isPrimary && <Badge variant="secondary">Primary</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {showRelationshipField
                      ? recipient.relationship || 'Relationship not set'
                      : 'Care recipient'}
                    {recipient.dateOfBirth
                      ? ` · DOB ${new Date(recipient.dateOfBirth).toLocaleDateString('en-US')}`
                      : ''}
                  </p>
                </div>
                {!recipient.isPrimary && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(recipient.id)}
                    disabled={isPending}
                    aria-label="Remove care recipient"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
