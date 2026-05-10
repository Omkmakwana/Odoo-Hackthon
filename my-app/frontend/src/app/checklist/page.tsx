import PageHeader from '@/components/shared/PageHeader';

export default function ChecklistPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <PageHeader title="Packing Checklist" subtitle="Screen 11 - Trip essentials" />
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm text-black/70">Checklist items go here.</p>
      </div>
    </section>
  );
}
