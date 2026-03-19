'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconCalendar,
  IconHeart,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import type {
  Client,
  PortalUser,
  CareShift,
  ShiftBooking,
  Worker,
  UserStatus,
  ServiceLevel,
  ClientType,
} from '@prisma/client';

import { cn, type Serialized } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ClientWithRelations = Client & {
  user: PortalUser;
  careShifts: (CareShift & {
    bookings: (ShiftBooking & {
      worker: Worker & {
        user: PortalUser;
      };
    })[];
  })[];
};

interface ClientDetailProps {
  client: Serialized<ClientWithRelations>;
}

const statusColors: Record<UserStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const serviceLevelColors: Record<ServiceLevel, string> = {
  COMPANION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  PERSONAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  SKILLED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500',
  LIVE_IN: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-500',
};

const clientTypeLabels: Record<ClientType, string> = {
  SELF: 'Self',
  FAMILY: 'Family',
  FACILITY: 'Facility',
};

export function ClientDetail({ client }: ClientDetailProps) {
  const fullAddress = [client.street, client.city, client.state, client.zip]
    .filter(Boolean)
    .join(', ');

  const totalShifts = client.careShifts.length;
  const bookedShifts = client.careShifts.filter(
    (s) => s.status === 'BOOKED' || s.status === 'COMPLETED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/clients">
              <IconArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {client.user.firstName} {client.user.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={cn('font-medium', statusColors[client.user.status])}>
                {client.user.status}
              </Badge>
              <Badge className={cn('font-medium', serviceLevelColors[client.serviceLevel])}>
                {client.serviceLevel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {clientTypeLabels[client.type]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <IconMail className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.user.email}</p>
                  </div>
                </div>
                {client.user.phone && (
                  <div className="flex items-center gap-3">
                    <IconPhone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{client.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <IconMapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Care Address</p>
                  <p className="font-medium">{fullAddress || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Care Recipient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconHeart className="size-5" />
                Care Recipient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {client.careRecipientName || 'Self'}
                  </p>
                </div>
                {client.relationship && (
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">{client.relationship}</p>
                  </div>
                )}
                {client.careRecipientDOB && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(client.careRecipientDOB).toLocaleDateString('en-US')}
                    </p>
                  </div>
                )}
              </div>

              {client.specialNeeds && client.specialNeeds.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Special Needs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {client.specialNeeds.map((need) => (
                        <Badge key={need} variant="outline">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {client.careNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Care Notes
                    </p>
                    <p className="text-sm">{client.careNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCalendar className="size-5" />
                Recent Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.careShifts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No shifts scheduled yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {client.careShifts.slice(0, 5).map((shift) => {
                    const assignedWorker = shift.bookings.find(
                      (b) => b.status === 'CONFIRMED' || b.status === 'ACCEPTED'
                    )?.worker;

                    return (
                      <Link
                        key={shift.id}
                        href={`/admin/shifts/${shift.id}`}
                        className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {new Date(shift.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{shift.status}</Badge>
                            {assignedWorker && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {assignedWorker.user.firstName}{' '}
                                {assignedWorker.user.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Shifts</span>
                <span className="font-medium">{totalShifts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Booked Shifts</span>
                <span className="font-medium">{bookedShifts}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing Rate</span>
                <span className="font-mono font-medium">
                  ${Number(client.billingRate).toFixed(2)}/hr
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {client.emergencyName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUsers className="size-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{client.emergencyName}</p>
                </div>
                {client.emergencyRelation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">{client.emergencyRelation}</p>
                  </div>
                )}
                {client.emergencyPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.emergencyPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/shifts?clientId=${client.id}`}>
                  <IconCalendar className="mr-2 size-4" />
                  View All Shifts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
