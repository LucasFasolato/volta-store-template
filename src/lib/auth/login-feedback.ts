export type LoginFeedback = {
  tone: 'error' | 'success' | 'pending'
  title: string
  message: string
  detail?: string
  email?: string | null
}

type SearchParamValue = string | string[] | undefined
type LoginSearchParams = Record<string, SearchParamValue>

function firstValue(value: SearchParamValue): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeToken(value: string | null | undefined): string {
  return value?.toLowerCase().trim() ?? ''
}

export function inferLoginErrorReason({
  reason,
  error,
  errorDescription,
  provider,
}: {
  reason?: string | null
  error?: string | null
  errorDescription?: string | null
  provider?: string | null
}): 'auth' | 'invalid_link' | 'google' | 'callback' | 'rate_limit' {
  const normalizedReason = normalizeToken(reason)

  if (normalizedReason === 'rate_limit') return 'rate_limit'
  if (normalizedReason === 'invalid_link') return 'invalid_link'
  if (normalizedReason === 'google') return 'google'
  if (normalizedReason === 'callback') return 'callback'
  if (normalizedReason === 'auth') return 'auth'

  const providerToken = normalizeToken(provider)
  const haystack = normalizeToken([error, errorDescription, provider].filter(Boolean).join(' '))

  if (/rate.?limit|too many|retry|wait a bit|security purposes|over_email/.test(haystack)) {
    return 'rate_limit'
  }

  if (/expired|invalid|otp|token|code verifier|flow state|already used/.test(haystack)) {
    return 'invalid_link'
  }

  if (providerToken === 'google' || /\bgoogle\b/.test(haystack)) {
    return 'google'
  }

  if (/callback|provider|oauth|access_denied|exchange/.test(haystack)) {
    return 'callback'
  }

  return 'auth'
}

export function getLoginFeedbackFromSearchParams(
  searchParams: LoginSearchParams,
): LoginFeedback | null {
  const authState = normalizeToken(
    firstValue(searchParams.auth) ??
      firstValue(searchParams.status) ??
      firstValue(searchParams.state),
  )
  const sent = normalizeToken(firstValue(searchParams.sent))
  const email = firstValue(searchParams.email)

  if (authState === 'success') {
    return {
      tone: 'success',
      title: 'Acceso confirmado',
      message: 'Ya puedes volver a entrar al panel desde esta pantalla.',
      detail: 'Si usaste un enlace anterior, cierra esa ventana y continua desde aqui.',
      email,
    }
  }

  if (authState === 'pending' || sent === 'magic_link') {
    return {
      tone: 'pending',
      title: 'Revisa tu email',
      message: 'Te enviamos un acceso seguro para entrar al panel.',
      detail: 'Si no lo ves, revisa spam o promociones antes de pedir uno nuevo.',
      email,
    }
  }

  if (
    !firstValue(searchParams.reason) &&
    !firstValue(searchParams.error) &&
    !firstValue(searchParams.error_description) &&
    !firstValue(searchParams.provider)
  ) {
    return null
  }

  const reason = inferLoginErrorReason({
    reason: firstValue(searchParams.reason),
    error: firstValue(searchParams.error),
    errorDescription: firstValue(searchParams.error_description),
    provider: firstValue(searchParams.provider),
  })

  if (reason === 'rate_limit') {
    return {
      tone: 'pending',
      title: 'Espera un momento',
      message: 'Por seguridad frenamos nuevos intentos por un rato.',
      detail: 'Usa el ultimo enlace recibido o vuelve a intentarlo en unos minutos.',
      email,
    }
  }

  if (reason === 'invalid_link') {
    return {
      tone: 'error',
      title: 'Ese enlace ya no sirve',
      message: 'Pide un nuevo acceso y entra desde el correo mas reciente.',
      detail: 'Los enlaces vencidos o ya usados dejan de funcionar para proteger tu cuenta.',
      email,
    }
  }

  if (reason === 'google') {
    return {
      tone: 'error',
      title: 'Google no pudo completar el ingreso',
      message: 'Prueba otra vez con Google o usa el acceso por email.',
      detail: 'Si se abrio una ventana vieja, cierrala y vuelve a intentar.',
      email,
    }
  }

  if (reason === 'callback') {
    return {
      tone: 'error',
      title: 'No pudimos confirmar el acceso',
      message: 'La verificacion no termino bien. Vuelve a intentarlo desde esta pantalla.',
      detail: 'Si venias de un proveedor externo, reintenta desde el boton correspondiente.',
      email,
    }
  }

  return {
    tone: 'error',
    title: 'No pudimos iniciar sesion',
    message: 'Intenta nuevamente con Google o pide un nuevo enlace por email.',
    detail: 'Si el problema sigue, espera un momento y vuelve a intentar.',
    email,
  }
}
