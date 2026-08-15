import type { Metadata } from 'next'
import { LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - VOLTA Store',
  description: 'Condiciones aplicables al uso de VOLTA Store y sus servicios.',
  alternates: { canonical: 'https://voltastore.app/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Condiciones del servicio"
      title="Términos y Condiciones"
      intro="Estos Términos regulan el acceso y uso de VOLTA Store. Al crear una cuenta o utilizar la Plataforma, la persona usuaria acepta estas condiciones en la medida permitida por la legislación aplicable."
      updatedAt="15 de agosto de 2026"
    >
      <LegalSection title="1. Qué es VOLTA Store">
        <p>
          VOLTA Store es una plataforma digital que permite a comercios y emprendimientos crear y administrar una tienda online, organizar su catálogo y facilitar el contacto y la recepción de pedidos a través de WhatsApp y otros medios habilitados por la Plataforma.
        </p>
        <p>
          Salvo que se indique expresamente lo contrario, VOLTA Store actúa como proveedor de la infraestructura tecnológica y <strong>no es vendedor, fabricante, distribuidor ni parte de las operaciones comerciales</strong> celebradas entre cada tienda y sus compradores.
        </p>
      </LegalSection>

      <LegalSection title="2. Aceptación y capacidad">
        <p>
          Para utilizar una cuenta de VOLTA Store, la persona debe contar con capacidad legal suficiente para contratar y para administrar la actividad comercial vinculada a la cuenta. El uso de la Plataforma implica conocer y aceptar estos Términos y la Política de Privacidad.
        </p>
        <p>
          Si una persona utiliza VOLTA Store en representación de una empresa, comercio u otra organización, declara contar con autorización suficiente para obligarla respecto del uso de la Plataforma.
        </p>
      </LegalSection>

      <LegalSection title="3. Cuenta y acceso">
        <LegalList>
          <li>La persona usuaria es responsable de proporcionar información veraz y mantener actualizados los datos esenciales de su cuenta y negocio.</li>
          <li>El acceso puede realizarse mediante proveedores externos, como Google, o mediante enlaces de autenticación enviados por email.</li>
          <li>Los enlaces de acceso son personales, temporales y de un solo uso. No deben reenviarse ni compartirse.</li>
          <li>La persona usuaria debe proteger sus dispositivos, correo electrónico, cuenta de Google y demás credenciales asociadas.</li>
          <li>VOLTA Store puede limitar temporalmente accesos cuando existan indicios razonables de fraude, abuso, riesgo de seguridad o incumplimiento.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Uso permitido de la Plataforma">
        <p>La persona usuaria puede utilizar VOLTA Store para fines comerciales lícitos y relacionados con las funciones ofrecidas. No está permitido:</p>
        <LegalList>
          <li>Usar la Plataforma para actividades ilegales, fraudulentas, engañosas o que vulneren derechos de terceros.</li>
          <li>Publicar contenido ilícito, discriminatorio, difamatorio, engañoso o que infrinja propiedad intelectual, privacidad u otros derechos.</li>
          <li>Intentar acceder a cuentas, sistemas, datos o recursos para los que no se tenga autorización.</li>
          <li>Interferir con la seguridad, disponibilidad o funcionamiento de VOLTA Store, realizar ataques automatizados, introducir malware o eludir controles técnicos.</li>
          <li>Utilizar la Plataforma para vender bienes o servicios cuya comercialización esté prohibida por la legislación aplicable.</li>
          <li>Suplantar identidades o presentar información comercial que pueda inducir a error sobre la identidad, características o condiciones del negocio.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Responsabilidades de cada tienda">
        <p>
          Cada comercio es responsable de su actividad, del contenido que publica y de las relaciones que mantiene con sus compradores. Esto incluye, entre otras cuestiones:
        </p>
        <LegalList>
          <li>La existencia, calidad, seguridad, legalidad, disponibilidad y descripción de los productos o servicios ofrecidos.</li>
          <li>Precios, promociones, stock, impuestos, costos de envío, condiciones de entrega, garantías, cambios, devoluciones y cualquier otra condición comercial.</li>
          <li>El cumplimiento de obligaciones fiscales, registrales, regulatorias, de defensa del consumidor y de protección de datos que correspondan.</li>
          <li>Responder consultas, reclamos, pedidos y obligaciones asumidas frente a sus compradores.</li>
          <li>Contar con derechos suficientes sobre nombres, marcas, fotografías, textos y demás materiales cargados en la Plataforma.</li>
        </LegalList>
        <p>
          En Argentina, las relaciones de consumo pueden estar alcanzadas por la Ley N.º 24.240 de Defensa del Consumidor, el Código Civil y Comercial y demás normativa aplicable. Nada en estos Términos pretende limitar derechos irrenunciables de consumidores o usuarios.
        </p>
      </LegalSection>

      <LegalSection title="6. Pedidos y WhatsApp">
        <p>
          VOLTA Store puede facilitar el inicio de una conversación o pedido mediante WhatsApp. El envío, recepción o continuidad de esa comunicación depende de servicios de terceros, de la conectividad y de las configuraciones del comercio y del comprador.
        </p>
        <p>
          Cuando un pedido continúa fuera de VOLTA Store, por ejemplo dentro de WhatsApp, la conversación, confirmación de compra, cobro, entrega y soporte posterior se desarrollan bajo responsabilidad del comercio y de los servicios externos involucrados.
        </p>
      </LegalSection>

      <LegalSection title="7. Contenido de la persona usuaria">
        <p>
          La persona usuaria conserva los derechos que le correspondan sobre el contenido que carga en VOLTA Store. Al publicarlo o almacenarlo en la Plataforma, otorga a VOLTA Store una licencia limitada, no exclusiva y por el tiempo necesario para alojar, procesar, reproducir técnicamente y mostrar dicho contenido únicamente con el fin de prestar, mantener, proteger y mejorar el servicio.
        </p>
        <p>
          La persona usuaria declara que tiene los derechos y autorizaciones necesarios para utilizar ese contenido y que su tratamiento no viola derechos de terceros ni normas aplicables.
        </p>
      </LegalSection>

      <LegalSection title="8. Propiedad intelectual de VOLTA Store">
        <p>
          La Plataforma, su software, interfaz, diseño, identidad visual, documentación, componentes y demás elementos propios de VOLTA Store están protegidos por las normas de propiedad intelectual aplicables. Estos Términos no transfieren a la persona usuaria derechos de propiedad sobre VOLTA Store ni autorizan a copiar, revender, descompilar o explotar el servicio fuera de los usos expresamente permitidos.
        </p>
      </LegalSection>

      <LegalSection title="9. Servicios de terceros">
        <p>
          Para funcionar, VOLTA Store puede integrarse o depender de servicios de terceros, entre ellos proveedores de autenticación, infraestructura, email, almacenamiento o mensajería. El uso de esos servicios puede estar sujeto además a los términos y políticas de sus respectivos proveedores.
        </p>
        <p>
          VOLTA Store no controla la disponibilidad permanente de servicios externos y no será responsable por interrupciones atribuibles exclusivamente a terceros fuera de su control razonable, sin perjuicio de las obligaciones que legalmente correspondan.
        </p>
      </LegalSection>

      <LegalSection title="10. Disponibilidad, mantenimiento y cambios">
        <p>
          Procuramos mantener la Plataforma disponible y operativa, pero no garantizamos funcionamiento ininterrumpido ni ausencia absoluta de errores. Podemos realizar mantenimiento, mejoras, cambios técnicos o ajustes de funcionalidad para proteger la seguridad, calidad y continuidad del servicio.
        </p>
        <p>
          Cuando una modificación material afecte de forma relevante a las personas usuarias, procuraremos comunicarla con una antelación razonable cuando ello sea posible.
        </p>
      </LegalSection>

      <LegalSection title="11. Planes, precios y pagos">
        <p>
          VOLTA Store puede ofrecer funcionalidades gratuitas y, en el futuro, planes o funciones pagas. Cuando una funcionalidad requiera un pago, el precio, periodicidad, impuestos aplicables y condiciones relevantes se informarán antes de contratarla.
        </p>
        <p>
          Ninguna disposición de estos Términos autoriza cargos no informados previamente. Las condiciones particulares de un plan pago que se presenten al momento de la contratación complementarán estos Términos.
        </p>
      </LegalSection>

      <LegalSection title="12. Suspensión y finalización">
        <p>
          La persona usuaria puede dejar de utilizar la Plataforma en cualquier momento. VOLTA Store puede suspender o limitar una cuenta cuando exista incumplimiento de estos Términos, riesgo para otras personas, fraude, abuso, requerimiento legal o amenaza razonable para la seguridad o integridad de la Plataforma.
        </p>
        <p>
          Siempre que sea razonable y legalmente posible, procuraremos informar la causa y permitir la regularización antes de una suspensión definitiva. Las obligaciones que por su naturaleza deban sobrevivir al cierre de una cuenta seguirán vigentes.
        </p>
      </LegalSection>

      <LegalSection title="13. Privacidad y datos personales">
        <p>
          El tratamiento de datos personales realizado por VOLTA Store se describe en la <a className="font-medium text-slate-900 underline underline-offset-4" href="/privacy">Política de Privacidad</a>. Cada comercio es responsable por los datos personales que recopila o administra de sus propios compradores y contactos, de acuerdo con la legislación aplicable.
        </p>
      </LegalSection>

      <LegalSection title="14. Garantías y limitación de responsabilidad">
        <p>
          VOLTA Store presta una herramienta tecnológica y no garantiza resultados comerciales específicos, niveles de venta, conversión, facturación ni disponibilidad de compradores. La persona usuaria conserva el control y responsabilidad sobre las decisiones comerciales que adopta utilizando la Plataforma.
        </p>
        <p>
          En la máxima medida permitida por la ley, VOLTA Store no será responsable por daños indirectos o pérdidas derivadas exclusivamente de contenido cargado por usuarios, incumplimientos de comercios frente a compradores, actos de terceros o servicios externos fuera de su control razonable. Esta cláusula no excluye responsabilidades que no puedan ser limitadas por ley ni derechos irrenunciables reconocidos a consumidores y usuarios.
        </p>
      </LegalSection>

      <LegalSection title="15. Indemnidad">
        <p>
          En la medida permitida por la normativa aplicable, la persona usuaria deberá mantener indemne a VOLTA Store frente a reclamos de terceros originados directamente en contenido, productos, servicios o actividades ilícitas atribuibles a esa persona usuaria, o en un incumplimiento de estos Términos, salvo cuando el reclamo derive de una conducta imputable a VOLTA Store.
        </p>
      </LegalSection>

      <LegalSection title="16. Cambios a estos Términos">
        <p>
          Estos Términos pueden actualizarse para reflejar cambios legales, técnicos o del servicio. La versión vigente mostrará su fecha de última actualización. Si los cambios son materiales, procuraremos informar a las personas usuarias por medios razonables antes de que resulten aplicables cuando corresponda.
        </p>
      </LegalSection>

      <LegalSection title="17. Legislación aplicable y resolución de conflictos">
        <p>
          Estos Términos se interpretarán conforme a las leyes de la República Argentina, sin perjuicio de las normas imperativas que resulten aplicables según la jurisdicción de cada persona usuaria. Si existe una relación de consumo, se respetarán las reglas protectorias y de competencia jurisdiccional que correspondan.
        </p>
        <p>
          Antes de iniciar una controversia formal, invitamos a las partes a intentar resolver de buena fe cualquier diferencia mediante los canales de contacto de VOLTA Store.
        </p>
      </LegalSection>

      <LegalSection title="18. Contacto">
        <p>
          Para consultas sobre estos Términos, cuestiones legales o solicitudes relacionadas con la Plataforma, escribinos a <a className="font-medium text-slate-900 underline underline-offset-4" href="mailto:legal@voltastore.app">legal@voltastore.app</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
