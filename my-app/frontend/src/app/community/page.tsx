import PageHeader from '@/components/shared/PageHeader';

export default function CommunityPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader title="Community" subtitle="Screen 10 - Travel feed" />
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm text-black/70">Community post cards go here.</p>
      </div>
    </section>
  );
}
