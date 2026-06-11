import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles, TrendingDown } from "lucide-react";

const HERO_MASCOT_IMAGE = "/homara-mascot.webp";

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-hero">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full border border-primary-foreground/10 animate-orbit opacity-30" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full border border-primary-foreground/5" />
      <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-accent/40 animate-float" />
      <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-accent/30 animate-float" style={{ animationDelay: "2s" }} />
    </div>

    <div className="container mx-auto px-4 py-8 md:py-14 lg:py-20 relative z-10">
      <div className="flex flex-col gap-5 md:gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,520px)] lg:gap-x-10 lg:gap-y-0 lg:items-center">
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm mb-4 md:mb-5 animate-fade-in">
            <TrendingDown className="w-4 h-4 text-accent" />
            Más de 15.000 productos comparados en tiempo real
          </div>

          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight animate-slide-up">
            El mejor precio para
            <span className="block text-accent">tu hogar</span>
          </h2>
        </div>

        <div className="relative animate-fade-in lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center" style={{ animationDelay: "0.15s" }}>
          <div className="hidden lg:block absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-primary-foreground/20" />
          <div className="hidden lg:block absolute -right-6 top-8 h-36 w-36 rounded-full border border-primary-foreground/15" />
          <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[520px]">
            <Image
              src={HERO_MASCOT_IMAGE}
              alt="Mascota de Homara"
              width={520}
              height={520}
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 520px, (min-width: 640px) 280px, 240px"
              className="relative z-10 mx-auto w-full h-auto object-contain max-h-[220px] sm:max-h-[250px] lg:max-h-[520px] drop-shadow-[0_18px_24px_rgba(5,18,49,0.24)] lg:drop-shadow-[0_22px_28px_rgba(5,18,49,0.28)] lg:scale-110 lg:origin-bottom"
            />
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-5 md:mb-7 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Compara precios de muebles, electrodomésticos, decoración y más entre las mejores tiendas de España. Ahorra hasta un 40% en cada compra.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <a href="#supergangas" className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-all shadow-glow">
              Empezar a comparar
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/asistente" className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-primary-foreground/10 text-primary-foreground font-semibold text-base hover:bg-primary-foreground/20 transition-all border border-primary-foreground/20">
              <Sparkles className="w-4 h-4" />
              Asistente de Compras
            </Link>
          </div>

          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6 text-primary-foreground/60 text-xs sm:text-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <span className="flex items-center gap-1.5">✓ 100% gratuito</span>
            <span className="flex items-center gap-1.5">✓ Sin registro</span>
            <span className="flex items-center gap-1.5">✓ +200 tiendas</span>
            <span className="flex items-center gap-1.5">✓ Actualizado diariamente</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
