import type { Metadata } from 'next'
import { LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Política de Privacidad - VOLTA Store',
  description: 'Cómo VOLTA Store recopila, utiliza, protege y conserva los datos personales.',
  alternates: { canonical: 'https://voltastore.app/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacidad y datos"
      title="Política de Privacidad"
      intro="Esta Política explica qué información trata VOLTA Store, para qué la utiliza, con quién puede compartirla y qué controles tienen las personas sobre sus datos."
      updatedAt="15 de agosto de 2026"
    >
      <LegalSection title="1. Alcance y responsable">
        <p>
          Esta Política de Privacidad aplica al sitio <strong>voltastore.app</strong>, al panel de administración, a las tiendas publicadas mediante VOLTA Store y a los servicios relacionados (en conjunto, la “Plataforma”). VOLTA Store actúa como responsable respecto de los datos necesarios para operar cuentas, autenticación, soporte, seguridad y funcionamiento de la Plataforma.
        </p>
        <p>
          Cuando una persona usuaria carga información de sus propios clientes, contactos, pedidos o compradores en una tienda creada con VOLTA Store, esa persona usuaria es responsable de contar con una base legal válida para tratar esos datos y de informar a sus clientes conforme a la normativa aplicable.
        </p>
      </LegalSection>

      <LegalSection title="2. Información que podemos recopilar">
        <LegalList>
          <li><strong>Datos de cuenta:</strong> dirección de email, identificador de usuario y, cuando se usa Google, nombre, foto de perfil y datos básicos que Google autoriza a compartir para el inicio de sesión.</li>
          <li><strong>Datos del negocio:</strong> nombre comercial, WhatsApp de pedidos, configuración de la tienda, identidad visual, textos, categorías, productos, precios, imágenes y demás contenido que la persona usuaria decida publicar o administrar.</li>
          <li><strong>Datos de uso y seguridad:</strong> información técnica necesaria para autenticar sesiones, prevenir fraude, diagnosticar errores y proteger la Plataforma, como direcciones IP, marcas de tiempo, eventos de autenticación, tipo de dispositivo o navegador y registros técnicos.</li>
          <li><strong>Datos de comunicaciones:</strong> mensajes o información que una persona remita voluntariamente a soporte o a los canales de contacto de VOLTA Store.</li>
          <li><strong>Datos de pedidos o compradores:</strong> solamente en la medida en que la funcionalidad utilizada por la tienda los procese. VOLTA Store no requiere a los comercios que carguen datos innecesarios para la operación del servicio.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Para qué usamos la información">
        <LegalList>
          <li>Crear y administrar cuentas y sesiones.</li>
          <li>Permitir la creación, edición, publicación y operación de tiendas.</li>
          <li>Procesar accesos mediante Google o enlaces seguros enviados por email.</li>
          <li>Prestar soporte, responder consultas y resolver incidentes.</li>
          <li>Prevenir accesos no autorizados, abuso, fraude y otros riesgos de seguridad.</li>
          <li>Medir la estabilidad y funcionamiento técnico de la Plataforma y corregir errores.</li>
          <li>Cumplir obligaciones legales, regulatorias o requerimientos válidos de autoridad competente.</li>
          <li>Defender derechos, prevenir daños y hacer cumplir los Términos y Condiciones.</li>
        </LegalList>
        <p>
          VOLTA Store no vende datos personales a anunciantes ni utiliza la información de autenticación para publicidad comportamental de terceros.
        </p>
      </LegalSection>

      <LegalSection title="4. Bases legales y consentimiento">
        <p>
          El tratamiento se realiza, según corresponda, para ejecutar la relación contractual con la persona usuaria, cumplir obligaciones legales, atender intereses legítimos relacionados con la seguridad y operación del servicio, o sobre la base del consentimiento cuando éste resulte exigible.
        </p>
        <p>
          En Argentina, VOLTA Store procura actuar de acuerdo con la Ley N.º 25.326 de Protección de los Datos Personales, su reglamentación y normas complementarias. Nada de esta Política limita derechos irrenunciables reconocidos por la legislación aplicable.
        </p>
      </LegalSection>

      <LegalSection title="5. Proveedores y terceros que intervienen">
        <p>
          Para operar la Plataforma podemos utilizar prestadores tecnológicos especializados. Actualmente la arquitectura puede involucrar servicios como <strong>Supabase</strong> para base de datos y autenticación, <strong>Google</strong> para inicio de sesión, <strong>Vercel</strong> para infraestructura y hosting, y <strong>Resend</strong> para entrega de emails transaccionales.
        </p>
        <p>
          Estos proveedores reciben únicamente la información necesaria para prestar sus servicios y están sujetos a sus propias obligaciones contractuales, políticas de privacidad y medidas de seguridad. Algunos pueden procesar información desde otros países; por ello pueden existir transferencias internacionales de datos conforme a mecanismos y garantías admitidos por la normativa aplicable.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies, sesiones y tecnologías similares">
        <p>
          VOLTA Store utiliza cookies, almacenamiento local u otros identificadores técnicos estrictamente necesarios para mantener sesiones, autenticación, seguridad, preferencias y funcionamiento básico del producto. Sin estas tecnologías algunas funciones, como iniciar sesión o mantener una cuenta autenticada, pueden no operar correctamente.
        </p>
        <p>
          Si en el futuro incorporamos analítica no esencial, publicidad o tecnologías que requieran consentimiento específico, esta Política será actualizada y, cuando corresponda, se ofrecerán controles adicionales.
        </p>
      </LegalSection>

      <LegalSection title="7. Conservación de datos">
        <p>
          Conservamos la información durante el tiempo necesario para prestar el servicio, mantener la cuenta activa, atender solicitudes, preservar la seguridad y cumplir obligaciones legales. Algunos registros técnicos y copias de respaldo pueden mantenerse por períodos limitados adicionales por razones de continuidad operativa, seguridad o cumplimiento.
        </p>
        <p>
          Cuando una cuenta se elimina, los datos asociados se eliminan o anonimizan dentro de plazos razonables, salvo aquella información que deba conservarse por una obligación legal, para resolver disputas o para proteger derechos legítimos.
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables destinadas a proteger la información contra acceso no autorizado, pérdida, alteración, divulgación o destrucción. Entre otras medidas, utilizamos autenticación segura, comunicaciones cifradas, controles de acceso y servicios de infraestructura especializados.
        </p>
        <p>
          Ningún sistema conectado a Internet puede garantizar seguridad absoluta. Las personas usuarias también deben proteger sus dispositivos, cuentas de Google, correos electrónicos y cualquier otro medio utilizado para acceder a VOLTA Store.
        </p>
      </LegalSection>

      <LegalSection title="9. Derechos de las personas">
        <p>
          De acuerdo con la normativa aplicable, una persona puede solicitar acceso a sus datos personales y, cuando corresponda, su actualización, rectificación, supresión o confidencialidad. También puede consultar la finalidad del tratamiento y ejercer otros derechos reconocidos por la legislación vigente.
        </p>
        <p>
          Para ejercer estos derechos o realizar una consulta de privacidad, se puede escribir a <a className="font-medium text-slate-900 underline underline-offset-4" href="mailto:legal@voltastore.app">legal@voltastore.app</a>. Podremos solicitar información razonable para verificar la identidad antes de responder una solicitud que involucre datos personales.
        </p>
      </LegalSection>

      <LegalSection title="10. Datos de menores de edad">
        <p>
          VOLTA Store está orientado a personas y negocios que cuentan con capacidad legal suficiente para administrar una actividad comercial. No está diseñado para que menores de edad creen cuentas de forma independiente. Si detectamos una cuenta creada en incumplimiento de esta condición, podremos adoptar medidas para limitarla o eliminarla conforme a la normativa aplicable.
        </p>
      </LegalSection>

      <LegalSection title="11. Tiendas creadas por usuarios">
        <p>
          Cada comercio que utiliza VOLTA Store controla el contenido, productos, precios, mensajes, condiciones comerciales y datos que publica en su propia tienda. Las consultas sobre una compra, pedido, producto o tratamiento de datos realizado directamente por un comercio deben dirigirse primero a ese comercio, sin perjuicio de los canales de VOLTA Store para cuestiones relacionadas con la Plataforma.
        </p>
      </LegalSection>

      <LegalSection title="12. Cambios a esta Política">
        <p>
          Podemos actualizar esta Política para reflejar cambios en la Plataforma, proveedores, normativa o prácticas de seguridad. La fecha de última actualización aparecerá al comienzo del documento. Cuando un cambio sea material y resulte razonable hacerlo, procuraremos comunicarlo mediante la Plataforma o por un medio de contacto disponible.
        </p>
      </LegalSection>

      <LegalSection title="13. Contacto">
        <p>
          Para consultas relacionadas con privacidad, protección de datos o esta Política, escribinos a <a className="font-medium text-slate-900 underline underline-offset-4" href="mailto:legal@voltastore.app">legal@voltastore.app</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
