import { PricingTierForm } from '../pricing-tier-form';

export const metadata = {
  title: 'New Pricing Tier',
  description: 'Create a new pricing tier',
};

export default function NewPricingTierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Pricing Tier</h1>
        <p className="text-muted-foreground">
          Create a new pricing tier for the public services page
        </p>
      </div>
      <PricingTierForm />
    </div>
  );
}
