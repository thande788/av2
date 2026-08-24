import type { Metadata } from 'next';
import { getServiceTypeOptions } from '@/lib/service-types';
import { ServiceTypesManager } from './service-types-manager';

export const metadata: Metadata = {
  title: 'Service Types',
  description: 'Configure operational service types for shifts',
};

export default async function ServiceTypesPage() {
  const serviceTypes = await getServiceTypeOptions({ includeInactive: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Types</h1>
        <p className="text-muted-foreground">
          Configure labels and default worker-rate percentages used in shift create/edit flows.
        </p>
      </div>

      <ServiceTypesManager serviceTypes={serviceTypes} />
    </div>
  );
}
