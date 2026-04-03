import { StateScreen } from '@/components/common/StateScreen'

export default function NotFound() {
  return (
    <StateScreen
      eyebrow="404"
      title="No encontramos esa pagina"
      description="La ruta que abriste no existe o ya no esta disponible. Volve al inicio y segui navegando desde ahi."
    />
  )
}
