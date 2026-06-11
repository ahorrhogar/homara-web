import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad y protección de datos de Homara, conforme al RGPD y la LOPD-GDD.",
  alternates: { canonical: "/politica-privacidad" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <Breadcrumb items={[{ label: "Política de privacidad" }]} />

      <article className="mx-auto mt-4 max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">POLÍTICA DE PRIVACIDAD</h1>
        <p className="mt-1 text-sm text-muted-foreground">https://homara.es</p>

        <Section title="I. Política de privacidad y protección de datos">
          <p>
            En cumplimiento de la normativa vigente, Homara se compromete a adoptar las medidas técnicas y organizativas
            necesarias para garantizar un nivel de seguridad adecuado al riesgo de los datos personales tratados.
          </p>
        </Section>

        <Section title="Leyes que incorpora esta política de privacidad">
          <ul className="list-disc space-y-2 pl-5">
            <li>Reglamento (UE) 2016/679 (RGPD).</li>
            <li>Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD).</li>
            <li>Real Decreto 1720/2007, de desarrollo de la LOPD.</li>
            <li>Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).</li>
          </ul>
        </Section>

        <Section title="Identidad del responsable del tratamiento">
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Responsable:</span> Lucas Álvarez (titular de Homara)</li>
            <li><span className="font-medium text-foreground">NIF:</span> 20562014Z</li>
            <li><span className="font-medium text-foreground">Dirección:</span> Paseo De La Marina 27, Castelldefels, Barcelona</li>
            <li><span className="font-medium text-foreground">Teléfono:</span> 644956232</li>
            <li><span className="font-medium text-foreground">Email:</span> lucasalvarezblancob@gmail.com</li>
          </ul>
        </Section>

        <Section title="Registro y principios aplicables">
          <p>
            Los datos personales recabados por Homara a través de formularios se incorporan a un registro de actividades de
            tratamiento para facilitar la gestión de consultas, solicitudes y la relación con el usuario.
          </p>
          <p>
            Se aplican los principios de licitud, lealtad y transparencia; limitación de la finalidad; minimización de datos;
            exactitud; limitación del plazo de conservación; integridad y confidencialidad; y responsabilidad proactiva.
          </p>
        </Section>

        <Section title="Categorías de datos y base legal">
          <p>
            Homara trata principalmente datos identificativos y de contacto. La base jurídica principal del tratamiento es el
            consentimiento del usuario, que puede retirarse en cualquier momento.
          </p>
        </Section>

        <Section title="Finalidades del tratamiento">
          <ul className="list-disc space-y-2 pl-5">
            <li>Atender consultas, solicitudes y comunicaciones del usuario.</li>
            <li>Gestionar la relación derivada del uso de formularios o canales de contacto.</li>
            <li>Mejorar la calidad, funcionamiento y navegación del sitio web.</li>
            <li>Realizar análisis estadístico y operativo del uso del sitio web.</li>
          </ul>
        </Section>

        <Section title="Plazo de conservación">
          <p>
            Los datos personales se conservarán durante el tiempo mínimo necesario para cumplir la finalidad para la que fueron
            recabados y, en todo caso, por un plazo orientativo máximo de 18 meses, salvo obligación legal distinta o ejercicio
            de derechos por parte del interesado.
          </p>
        </Section>

        <Section title="Destinatarios y menores de edad">
          <p>
            Con carácter general, no se comunican datos personales a terceros, salvo obligación legal o cuando sea necesario para
            prestar servicios vinculados al funcionamiento del sitio web. En caso de transferencias internacionales, se informará
            de forma previa y transparente.
          </p>
          <p>
            Solo los mayores de 14 años pueden consentir válidamente el tratamiento de sus datos personales. Para menores de 14
            años, será necesario el consentimiento de padres o tutores.
          </p>
        </Section>

        <Section title="Seguridad y confidencialidad">
          <p>
            Homara aplica medidas de seguridad orientadas a evitar la alteración, pérdida, tratamiento o acceso no autorizado a
            los datos personales. Asimismo, se utiliza cifrado SSL en las comunicaciones con el sitio web.
          </p>
        </Section>

        <Section title="Derechos de las personas usuarias">
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad, oposición
            y a no ser objeto de decisiones automatizadas mediante comunicación escrita con referencia RGPD a la dirección o
            correo del responsable.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Dirección postal: Paseo De La Marina 27, Castelldefels, Barcelona.</li>
            <li>Email: lucasalvarezblancob@gmail.com</li>
          </ul>
        </Section>

        <Section title="Enlaces externos y reclamaciones">
          <p>
            Este sitio puede incluir enlaces a páginas de terceros. Homara no es responsable de las políticas de privacidad ni de
            las prácticas de tratamiento de datos de dichos sitios.
          </p>
          <p>
            Si consideras que existe una infracción en materia de protección de datos, puedes presentar una reclamación ante la
            Agencia Española de Protección de Datos (AEPD):{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              https://www.aepd.es
            </a>
            .
          </p>
        </Section>

        <section className="mt-8 space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-lg font-semibold text-foreground">II. Aceptación y cambios de esta política</h2>
          <p>
            El uso de Homara implica la aceptación de esta Política de Privacidad. Esta política puede actualizarse por cambios
            legales, jurisprudenciales o de criterio de la autoridad de control. Se recomienda su revisión periódica.
          </p>
          <p>Última actualización: 19/04/2026.</p>
        </section>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
