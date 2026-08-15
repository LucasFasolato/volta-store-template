'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

export function EmailConfirmForm({ tokenHash, next }: { tokenHash: string; next: string }) {
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      method="post"
      action="/auth/email/confirm"
      className="mt-8"
      onSubmit={() => setSubmitting(true)}
    >
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#12e89a] px-5 text-sm font-semibold text-[#062117] shadow-[0_16px_36px_rgba(18,232,154,.2)] transition hover:bg-[#0fd98f] active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Confirmando acceso...
          </>
        ) : (
          <>
            Entrar a VOLTA
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  )
}
