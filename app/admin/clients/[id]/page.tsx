import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientDetail } from './client-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const client = await db.client.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!client) {
    return { title: 'Client Not Found' };
  }

  return {
    title: `${client.user.firstName} ${client.user.lastName} | Admin`,
  };
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  
  const client = await db.client.findUnique({
    where: { id },
    include: {
      user: true,
      careShifts: {
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          bookings: {
            include: {
              worker: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} />;
}
