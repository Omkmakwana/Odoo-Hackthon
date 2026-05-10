export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-black/50">Traveloop</p>
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="max-w-2xl text-sm text-black/70">{subtitle}</p> : null}
    </header>
  );
}
