import PageHeader from '@/components/shared/PageHeader';

export default function InvoicePage({ params }: { params: { id: string } }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <PageHeader title="Expense Invoice" subtitle={`Screen 14 - Trip ${params.id}`} />
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm text-black/70">Invoice and expense breakdown go here.</p>
      </div>
    </section>
  );
}
