import { FAQForm } from '../faq-form';

export const metadata = {
  title: 'New FAQ | Admin Dashboard',
  description: 'Add a new FAQ',
};

export default function NewFAQPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Add FAQ</h1>
        <p className="text-muted-foreground">
          Create a new frequently asked question
        </p>
      </div>

      <FAQForm />
    </div>
  );
}
