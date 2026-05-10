import PageHeader from '@/components/shared/PageHeader';

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader title="Admin" subtitle="Screen 12 - Platform stats" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-black/10 bg-white p-6">Users</div>
        <div className="rounded-3xl border border-black/10 bg-white p-6">Trips</div>
        <div className="rounded-3xl border border-black/10 bg-white p-6">Revenue</div>
      </div>
    </section>
  );
}
