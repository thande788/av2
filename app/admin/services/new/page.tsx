import { CategoryForm } from '../category-form';

export const metadata = {
  title: 'New Service Category | Admin Dashboard',
  description: 'Add a new service category',
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Add Service Category</h1>
        <p className="text-muted-foreground">
          Create a new category grouping for services
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
