import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { useSettings } from '@/contexts/SettingsContext'

const PrivacyPolicy = () => {
  const { storeName } = useSettings()

  return (
    <EcommerceTemplate>
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Aviso de Privacidad</h1>
        <p className="text-muted-foreground text-sm">Última actualización: abril 2025</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Responsable del Tratamiento</h2>
          <p className="text-foreground/80 leading-relaxed">
            {storeName} es responsable del tratamiento de tus datos personales. Este Aviso de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestro sitio web y servicios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. Datos que Recopilamos</h2>
          <p className="text-foreground/80 leading-relaxed">Recopilamos los siguientes tipos de información:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Datos de identificación:</strong> nombre, apellidos, correo electrónico y número de teléfono.</li>
            <li><strong>Datos de envío:</strong> dirección postal, ciudad, estado, código postal y país.</li>
            <li><strong>Datos de pago:</strong> procesados de forma segura por proveedores de pago certificados. {storeName} no almacena datos de tarjetas.</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia.</li>
            <li><strong>Datos de pedidos:</strong> historial de compras, productos adquiridos y preferencias.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. Finalidad del Tratamiento</h2>
          <p className="text-foreground/80 leading-relaxed">Utilizamos tus datos personales para:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Procesar y gestionar tus pedidos y pagos.</li>
            <li>Enviarte confirmaciones de pedido y actualizaciones de envío.</li>
            <li>Brindarte atención al cliente y soporte.</li>
            <li>Enviarte comunicaciones comerciales y promocionales (solo con tu consentimiento).</li>
            <li>Mejorar nuestro sitio web y la experiencia de usuario.</li>
            <li>Cumplir con obligaciones legales y fiscales.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Cookies y Tecnologías de Rastreo</h2>
          <p className="text-foreground/80 leading-relaxed">
            Nuestro sitio utiliza cookies y tecnologías similares para mejorar tu experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido. Las cookies esenciales son necesarias para el funcionamiento del sitio. Las cookies de análisis nos ayudan a entender cómo interactúas con el sitio. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Compartir Datos con Terceros</h2>
          <p className="text-foreground/80 leading-relaxed">
            Podemos compartir tu información personal con terceros de confianza únicamente cuando sea necesario para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Procesamiento de pagos:</strong> proveedores de pago seguros para completar transacciones.</li>
            <li><strong>Envío y logística:</strong> empresas de paquetería para entregar tus pedidos.</li>
            <li><strong>Análisis:</strong> herramientas de análisis para mejorar nuestros servicios.</li>
            <li><strong>Obligaciones legales:</strong> cuando sea requerido por ley o autoridades competentes.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines de marketing sin tu consentimiento explícito.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Seguridad de los Datos</h2>
          <p className="text-foreground/80 leading-relaxed">
            Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información personal contra acceso no autorizado, pérdida, alteración o destrucción. Sin embargo, ningún sistema de transmisión o almacenamiento de datos es completamente seguro, por lo que no podemos garantizar la seguridad absoluta de tu información.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Tus Derechos</h2>
          <p className="text-foreground/80 leading-relaxed">Tienes derecho a:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Acceso:</strong> solicitar una copia de los datos personales que tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos personales.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para ciertos fines.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            Para ejercer cualquiera de estos derechos, contáctanos a través de los canales disponibles en nuestro sitio web.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">8. Retención de Datos</h2>
          <p className="text-foreground/80 leading-relaxed">
            Conservamos tus datos personales solo durante el tiempo necesario para cumplir con los fines para los que fueron recopilados, incluyendo obligaciones legales, contables o de reporte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">9. Modificaciones al Aviso</h2>
          <p className="text-foreground/80 leading-relaxed">
            {storeName} se reserva el derecho de actualizar este Aviso de Privacidad en cualquier momento. Cualquier cambio será publicado en esta página con la fecha de última actualización. Te recomendamos revisarlo periódicamente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">10. Contacto</h2>
          <p className="text-foreground/80 leading-relaxed">
            Si tienes preguntas o inquietudes sobre este Aviso de Privacidad o el tratamiento de tus datos personales, puedes contactarnos a través de los canales de atención disponibles en nuestro sitio web.
          </p>
        </section>
      </div>
    </EcommerceTemplate>
  )
}

export default PrivacyPolicy
