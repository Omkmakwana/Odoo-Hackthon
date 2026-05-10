import PageHeader from '@/components/shared/PageHeader';

export default function NotesPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <PageHeader title="Notes" subtitle="Screen 13 - Trip journal" />
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm text-black/70">Trip notes and journal entries go here.</p>
      </div>
    </section>
  );
}
