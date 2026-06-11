import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { buildAlternates } from "@/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Aviso legal y condiciones de uso",
    description: "Aviso legal y condiciones generales de uso de Homara, conforme a la LSSI-CE.",
    alternates: buildAlternates("/aviso-legal", locale),
  };
}

export default function LegalNoticePage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <Breadcrumb items={[{ label: "Aviso legal y condiciones de uso" }]} />

      <article className="mx-auto mt-4 max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">AVISO LEGAL Y CONDICIONES GENERALES DE USO</h1>
        <p className="mt-1 text-sm text-muted-foreground">https://homara.es</p>

        <Section title="I. Información general">
          <p>
            En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y del Comercio Electrónico
            (LSSI-CE), se informa de los siguientes datos identificativos del titular del sitio web Homara.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Titular:</span> Lucas Álvarez</li>
            <li><span className="font-medium text-foreground">NIF:</span> 20562014Z</li>
            <li><span className="font-medium text-foreground">Dirección:</span> Paseo De La Marina 27, Castelldefels, Barcelona</li>
            <li><span className="font-medium text-foreground">Teléfono:</span> 644956232</li>
            <li><span className="font-medium text-foreground">Email:</span> lucasalvarezblancob@gmail.com</li>
          </ul>
        </Section>

        <section id="condiciones-generales-de-uso" className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-lg font-semibold text-foreground">II. Términos y condiciones generales de uso</h2>
          <p>
            El objeto de estas condiciones es regular el acceso, navegación y uso del sitio web, así como las responsabilidades
            derivadas de la utilización de sus contenidos y servicios.
          </p>
          <p>
            El acceso a Homara es, con carácter general, libre y gratuito para los usuarios, sin perjuicio del coste de conexión
            a internet que aplique su proveedor.
          </p>
          <p>
            La navegación por este sitio atribuye la condición de usuario e implica la aceptación plena de estas condiciones.
            Homara podrá modificar en cualquier momento, y sin aviso previo, la presentación, configuración y contenido del sitio.
          </p>
          <p>
            El usuario se compromete a hacer un uso adecuado de la información y servicios, conforme a la ley, la buena fe, el
            orden público y el respeto de derechos de terceros.
          </p>
        </section>

        <Section title="III. Acceso y navegación: exclusión de garantías y responsabilidad">
          <p>
            Homara no garantiza la disponibilidad continua del sitio web ni la ausencia de errores. Se realizarán todos los
            esfuerzos razonables para asegurar su correcto funcionamiento.
          </p>
          <p>
            Homara no será responsable de daños derivados del uso del sitio web, incluyendo, sin limitación, interrupciones,
            fallos técnicos, introducción de virus o incidencias en telecomunicaciones ajenas a su control.
          </p>
        </Section>

        <Section title="IV. Política de enlaces">
          <p>
            Este sitio puede ofrecer enlaces a páginas de terceros para facilitar el acceso a información externa. Homara no
            comercializa ni controla directamente esos contenidos y no asume responsabilidad por su disponibilidad, legalidad,
            veracidad o calidad.
          </p>
          <p>
            Queda prohibida la reproducción total o parcial de contenidos del sitio sin autorización expresa del titular,
            incluyendo su uso comercial.
          </p>
        </Section>

        <Section title="V. Propiedad intelectual e industrial">
          <p>
            Homara y/o su titular son propietarios o licenciatarios de todos los derechos de propiedad intelectual e industrial
            sobre los contenidos del sitio web (textos, imágenes, diseño, código, marcas y otros elementos).
          </p>
          <p>
            Se permite la visualización y copia para uso exclusivamente personal y privado. Cualquier reproducción, distribución,
            comunicación pública o transformación con fines comerciales requerirá autorización previa y por escrito.
          </p>
        </Section>

        <section className="mt-8 space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-lg font-semibold text-foreground">VI. Acciones legales, legislación aplicable y jurisdicción</h2>
          <p>
            Homara se reserva el derecho de ejercitar las acciones civiles o penales que procedan ante cualquier uso indebido del
            sitio web o incumplimiento de estas condiciones.
          </p>
          <p>
            La relación entre el usuario y Homara se regirá por la normativa española vigente. Cualquier controversia se someterá
            a los juzgados y tribunales que correspondan conforme a derecho.
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
