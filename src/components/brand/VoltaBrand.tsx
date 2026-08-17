import Image from 'next/image'

export function VoltaBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-[10px] bg-white shadow-[0_8px_22px_rgba(15,23,42,.08)] ring-1 ring-black/6">
        <Image src="/brand/volta-mark.png" alt="" width={30} height={30} priority className="size-7 object-contain" />
      </span>
      {compact ? null : <span className="text-sm font-semibold tracking-[-0.03em]">VOLTA</span>}
    </span>
  )
}
