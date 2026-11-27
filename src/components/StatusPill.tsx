export default function StatusPill({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending: ['Pending', 'bg-gray-100 text-gray-700'],
    confirmed: ['Confirmed', 'bg-sky-50 text-sky-700'],
    processing: ['Packing', 'bg-violet-50 text-violet-700'],
    out_for_delivery: ['On the way', 'bg-amber-50 text-amber-800'],
    delivered: ['Delivered', 'bg-brand-50 text-brand-700'],
    cancelled: ['Cancelled', 'bg-red-50 text-red-700'],
  }
  const [label, cls] = map[status] ?? [status, 'bg-gray-100 text-gray-700']
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
}
