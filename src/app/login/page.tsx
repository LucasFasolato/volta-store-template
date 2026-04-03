import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Ingresar - Volta Store',
  description: 'Accede a tu panel de administracion',
}

export default function LoginPage() {
  return (
    <div className="admin-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[20px] bg-emerald-400 text-lg font-black text-black">
            V
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Volta Store</h1>
          <p className="mt-2 text-sm text-neutral-400">Tu panel para vender por WhatsApp con una experiencia premium.</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
