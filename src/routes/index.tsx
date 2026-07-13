import { createFileRoute } from "@tanstack/react-router";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  component: Index,
});

const EMAIL = "info@alpine-eco.co.za";
const PHONE_DISPLAY = "011 493 0113";
const PHONE_TEL = "+27114930113";
const ADDRESS = "22 Stevens Rd, Stafford, Johannesburg, 2197, South Africa";

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const MOTION_DURATION = 0.55;
const MOTION_LIFT = 8;
const MOTION_STAGGER = 0.06;

const NAV_LINKS = [
  ["story", "Story"],
  ["print", "What We Print"],
  ["work", "How We Work"],
  ["contact", "Contact"],
] as const;

const LazyMotionLayer = lazy(() =>
  import("@/components/MotionLayer").then((m) => ({ default: m.MotionLayer })),
);
const LazyMotionBackdrop = lazy(() =>
  import("@/components/MotionLayer").then((m) => ({ default: m.MotionBackdrop })),
);

type MotionMode = "idle" | "backdrop" | "full";

function resolveMotionMode(): Exclude<MotionMode, "idle"> {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    "connection" in navigator &&
    Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData,
    );
  // Keep decorative work paused while the tab is hidden; otherwise show full CSS-3D
  // on all viewports (including mobile). Static backdrop only for a11y / data-saver.
  if (reduce || saveData || document.hidden) return "backdrop";
  return "full";
}

/** Reactive motion mode — full CSS-3D by default; backdrop for reduced-motion / save-data. */
function useDeferredMotionMode(): MotionMode {
  const [mode, setMode] = useState<MotionMode>("idle");

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const apply = (next: Exclude<MotionMode, "idle">) => {
      if (cancelled) return;
      if (next === "full") void import("@/components/MotionLayer");
      setMode(next);
    };

    const schedule = () => {
      const next = resolveMotionMode();
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
        idleId = undefined;
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      if (next === "full" && typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => apply(next), { timeout: 280 });
      } else {
        timeoutId = window.setTimeout(() => apply(next), next === "full" ? 32 : 80);
      }
    };

    schedule();

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => schedule();

    mqReduced.addEventListener("change", onChange);
    document.addEventListener("visibilitychange", onChange);

    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    connection?.addEventListener?.("change", onChange);

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      mqReduced.removeEventListener("change", onChange);
      document.removeEventListener("visibilitychange", onChange);
      connection?.removeEventListener?.("change", onChange);
    };
  }, []);

  return mode;
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function ColorBar({ className = "" }: { className?: string }) {
  const colors = [
    "#00AEEF",
    "#EC008C",
    "#FFF200",
    "#231F20",
    "#0078A8",
    "#68B848",
  ];
  return (
    <div className={`color-bar ${className}`} aria-hidden>
      {colors.map((c) => (
        <span key={c} style={{ background: c }} />
      ))}
    </div>
  );
}

/** Official light-background logo mark. */
function Logo({
  className = "",
  size = "nav",
}: {
  className?: string;
  size?: "nav" | "hero" | "footer";
}) {
  const sizeClass =
    size === "hero"
      ? "h-16 w-auto max-w-[300px] object-contain object-left md:h-20 md:max-w-[360px]"
      : size === "footer"
        ? "h-11 w-auto max-w-[220px] object-contain md:h-12"
        : "h-10 w-auto max-w-[200px] object-contain md:h-11";

  return (
    <a
      href="#hero"
      onClick={(e) => {
        e.preventDefault();
        scrollTo("hero");
      }}
      className={`inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)] ${className}`}
      aria-label="Alpine-eco Notebooks & Diaries — home"
    >
      <picture>
        <source srcSet="/alpine-eco-logo.webp?v=3" type="image/webp" />
        <img
          src="/alpine-eco-logo.png?v=3"
          alt="Alpine-eco Notebooks & Diaries"
          className={sizeClass}
          width={360}
          height={144}
          decoding="async"
        />
      </picture>
    </a>
  );
}

function NavLink({
  id,
  label,
  active,
  onNavigate,
}: {
  id: string;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        scrollTo(id);
        onNavigate?.();
      }}
      aria-current={active ? "true" : undefined}
      className={`gradient-underline text-[12px] font-medium uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)] ${
        active
          ? "text-[color:var(--color-royal)]"
          : "text-[color:var(--color-ink-2)] hover:text-[color:var(--color-royal)]"
      }`}
    >
      {label}
    </a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      const ids = ["hero", "story", "print", "work", "contact"] as const;
      let current: string = "hero";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-white/95 shadow-[0_1px_0_rgba(0,120,168,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-12">
        <Logo
          className={`transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-100 md:opacity-0 md:pointer-events-none"
          }`}
        />

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map(([id, label]) => (
            <NavLink key={id} id={id} label={label} active={active === id} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("contact");
            }}
            className="btn-primary hidden sm:inline-flex"
            style={{ padding: "12px 22px" }}
          >
            Get In Touch
          </a>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[rgba(0,120,168,0.2)] bg-white/80 text-[color:var(--color-ink)] md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,320px)] border-l border-[rgba(0,120,168,0.14)] bg-[color:var(--color-cream)] p-0"
            >
              <SheetHeader className="border-b border-[rgba(0,120,168,0.1)] px-6 py-5 text-left">
                <SheetTitle className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-ink)]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
                {NAV_LINKS.map(([id, label]) => (
                  <SheetClose asChild key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(id);
                        setMenuOpen(false);
                      }}
                      className="rounded-[4px] px-3 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-ink-2)] hover:bg-white/70 hover:text-[color:var(--color-royal)]"
                    >
                      {label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo("contact");
                      setMenuOpen(false);
                    }}
                    className="btn-primary mt-4"
                  >
                    Get In Touch
                  </a>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: MOTION_LIFT },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION, ease: MOTION_EASE },
  },
} as const;

const fadeUpStatic = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
} as const;

function useRevealVariants() {
  const reduce = useReducedMotion();
  return reduce ? fadeUpStatic : fadeUp;
}

function useStaggerParent() {
  const reduce = useReducedMotion();
  return {
    show: {
      transition: { staggerChildren: reduce ? 0 : MOTION_STAGGER },
    },
  } as const;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow inline-flex items-center gap-2.5">
      <span className="reg-cross" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

function RulerProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  if (reduce) return null;

  return (
    <div className="ruler-progress" aria-hidden>
      <div
        className="absolute inset-y-0 right-0 w-px"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,120,168,0.35) 0 1px, transparent 1px 8px)",
        }}
      />
      <m.div
        className="absolute top-0 right-0 w-[3px] rounded-full bg-[color:var(--color-eco)]"
        style={{ height, originY: 0 }}
      />
    </div>
  );
}

function Hero({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  const reduce = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="crop-marks relative scroll-mt-24 overflow-hidden bg-transparent pt-28 pb-24 lg:pt-32 lg:pb-28"
    >
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 hidden md:block"
        style={{
          width: "52%",
          background:
            "linear-gradient(105deg, rgba(243,247,248,0.04) 0%, rgba(243,247,248,0.16) 48%, rgba(243,247,248,0.32) 100%)",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 4% 100%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:px-12">
        <m.div
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={stagger}
          className="lg:col-span-7"
        >
          <m.div variants={variants} className="flex flex-col items-start gap-3">
            <Logo size="hero" />
            <Eyebrow>Printing &amp; Book-Binding · Johannesburg</Eyebrow>
          </m.div>
          <m.h1 variants={variants} className="display-title mt-5">
            From the press to the{" "}
            <span className="ink-accent italic text-[color:var(--color-royal)]">spine.</span>
          </m.h1>
          <m.p
            variants={variants}
            className="mt-8 max-w-xl text-[clamp(1.05rem,2.2vw,1.2rem)] leading-relaxed text-[color:var(--color-body)]"
          >
            We print, cut and bind notebooks, diaries and journals in-house — one roof,
            one standard of finish.
          </m.p>
          <m.div variants={variants} className="mt-10 flex flex-wrap gap-3">
            <a href="#print" onClick={(e) => { e.preventDefault(); scrollTo("print"); }} className="btn-primary">
              What We Print
            </a>
            <a href="#story" onClick={(e) => { e.preventDefault(); scrollTo("story"); }} className="btn-ghost">
              Our Story
            </a>
          </m.div>
          <m.div variants={variants} className="mt-12">
            <ColorBar />
          </m.div>
        </m.div>
      </div>
    </section>
  );
}

function Section({
  id,
  children,
  className = "",
  sectionRef,
  deferPaint = false,
  withCrop = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  sectionRef?: RefObject<HTMLElement | null>;
  deferPaint?: boolean;
  withCrop?: boolean;
}) {
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative scroll-mt-24 py-32 lg:py-44 ${withCrop ? "crop-marks" : ""} ${deferPaint ? "cv-auto" : ""} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">{children}</div>
    </section>
  );
}

function SectionOpener({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      className="max-w-3xl"
    >
      <m.div variants={variants} className="mb-8">
        <ColorBar className="max-w-[180px]" />
      </m.div>
      <m.div variants={variants}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </m.div>
      <m.h2 variants={variants} className="section-title mt-6">
        {title}
      </m.h2>
      {children}
    </m.div>
  );
}

function Story() {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  return (
    <Section id="story" deferPaint>
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionOpener
            eyebrow="Our Story"
            title={
              <>
                A print shop and{" "}
                <span className="ink-accent italic text-[color:var(--color-royal)]">
                  bindery
                </span>
                , under one roof.
              </>
            }
          />
        </div>
        <m.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="lg:col-span-6 lg:col-start-7 lg:pt-16"
        >
          <m.p
            variants={variants}
            className="text-[18px] leading-relaxed text-[color:var(--color-body)] md:text-[19px]"
          >
            Based in Stafford, Johannesburg, Alpine-eco runs the press and the bindery
            ourselves. Notebooks, diaries and journals are printed, trimmed and bound
            on site — not assembled from outsourced parts.
          </m.p>
          <m.p
            variants={variants}
            className="mt-5 text-[18px] leading-relaxed text-[color:var(--color-body)] md:text-[19px]"
          >
            That is the whole business: accurate colour, clean finishing, and binding
            that holds up to real use — for offices, schools, studios and private
            orders across South Africa.
          </m.p>
          <m.ul variants={variants} className="mt-10 space-y-4">
            {[
              "Litho and digital printing, run in-house",
              "Binding and finishing completed under one roof",
              "Hand-checked before every delivery leaves Stafford",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 border-t border-[rgba(0,120,168,0.14)] pt-4 text-[16px] text-[color:var(--color-ink-2)]"
              >
                <span className="reg-cross mt-1.5" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </m.ul>
        </m.div>
      </div>
    </Section>
  );
}

function WhatWePrint() {
  const featured = {
    n: "01",
    title: "Notebooks",
    desc: "Soft and hard cover, ruled or dot-grid — sized for a desk, a bag, or a branded run. Printed and bound in Stafford.",
  };
  const supporting = [
    {
      n: "02",
      title: "Diaries",
      desc: "Daily and weekly planners with dated pages, printed and bound for a full year of use.",
    },
    {
      n: "03",
      title: "Journals",
      desc: "Unlined and lightly ruled pages for notes, sketches and long-form writing.",
    },
    {
      n: "04",
      title: "Corporate & Custom",
      desc: "Branded diaries and notebooks for teams, clients, schools and year-end gifting.",
    },
  ] as const;

  const variants = useRevealVariants();
  const stagger = useStaggerParent();

  return (
    <Section id="print" deferPaint withCrop>
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        className="max-w-3xl"
      >
        <m.div variants={variants} className="mb-8">
          <ColorBar className="max-w-[180px]" />
        </m.div>
        <m.div variants={variants}>
          <Eyebrow>What We Print</Eyebrow>
        </m.div>
        <m.h2 variants={variants} className="section-title mt-6">
          Notebooks, diaries — printed and bound to order.
        </m.h2>
        <m.p
          variants={variants}
          className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[color:var(--color-body)]"
        >
          From a short personal run to a full office order, we manufacture paper goods
          across four areas — printed and bound in Johannesburg.
        </m.p>
      </m.div>

      {/* Mobile: divided list */}
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={stagger}
        className="mt-12 divide-y divide-[rgba(0,120,168,0.12)] border-y border-[rgba(0,120,168,0.12)] md:hidden"
      >
        {[featured, ...supporting].map((item) => (
          <m.a
            key={item.title}
            variants={variants}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("contact");
            }}
            className="flex w-full items-start gap-4 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--color-royal)]"
          >
            <span className="font-serif text-[28px] leading-none tracking-tight text-[rgba(0,120,168,0.28)]">
              {item.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-[26px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                {item.title}
              </span>
              <span className="mt-2 block text-[15px] leading-relaxed text-[color:var(--color-body)]">
                {item.desc}
              </span>
              <span className="mt-3 inline-block text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-eco-deep)]">
                Discuss this product →
              </span>
            </span>
          </m.a>
        ))}
      </m.div>

      {/* Desktop: asymmetric editorial grid */}
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={stagger}
        className="mt-16 hidden gap-5 md:grid md:grid-cols-12"
      >
        <m.a
          variants={variants}
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("contact");
          }}
          className="product-feature md:col-span-7 lg:col-span-7"
        >
          <div>
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-[56px] leading-none tracking-tight text-[rgba(0,120,168,0.16)]">
                {featured.n}
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-[rgba(0,120,168,0.12)]"
              />
            </div>
            <h3 className="mt-8 font-serif text-[42px] leading-[1.08] tracking-tight text-[color:var(--color-ink)] lg:text-[48px]">
              {featured.title}
            </h3>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[color:var(--color-body)] md:text-[17px]">
              {featured.desc}
            </p>
          </div>
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-[rgba(0,120,168,0.1)] pt-5">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-eco-deep)]">
              Discuss this product
            </span>
            <span aria-hidden className="text-[color:var(--color-royal)]">
              →
            </span>
          </div>
        </m.a>

        <div className="flex flex-col gap-4 md:col-span-5">
          {supporting.map((item) => (
            <m.a
              key={item.title}
              variants={variants}
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("contact");
              }}
              className="product-panel"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-[24px] leading-none tracking-tight text-[rgba(0,120,168,0.22)]">
                  {item.n}
                </span>
                <h3 className="font-serif text-[24px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                  {item.title}
                </h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-body)]">
                {item.desc}
              </p>
              <span className="mt-4 inline-block text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-eco-deep)]">
                Discuss this product →
              </span>
            </m.a>
          ))}
        </div>
      </m.div>
    </Section>
  );
}

function HowWeWork({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const steps = [
    [
      "01",
      "Print",
      "Litho and digital printing in-house — colour, registration and stock under our control.",
    ],
    [
      "02",
      "Cut",
      "Every sheet trimmed and squared before it moves to the bindery.",
    ],
    [
      "03",
      "Bind",
      "Perfect, saddle-stitch or casebound — matched to the job, not a one-size process.",
    ],
    [
      "04",
      "Finish & Check",
      "Covers, finishing and a final hand check before anything ships.",
    ],
  ] as const;
  const reduce = useReducedMotion();
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  const lineRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 80%", "end 40%"],
  });
  // Transform-only progress (scaleX + translateX), never width/left
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const markerX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section
      id="work"
      className="bg-[color:var(--color-cream)]/50"
      sectionRef={sectionRef}
      deferPaint
    >
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionOpener
            eyebrow="How We Work"
            title="From plates to pages, bound by hand."
          />
        </div>
        <m.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants}
          className="text-[18px] leading-relaxed text-[color:var(--color-body)] lg:col-span-6 lg:col-start-7 lg:pt-24"
        >
          We are not a reseller of imported stock. Alpine-eco runs the press and the
          bindery — which means tighter quality control, clearer turnaround, and the
          flexibility to take on genuine custom work.
        </m.p>
      </div>

      <div ref={lineRef} className="relative mt-20">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-[rgba(0,120,168,0.18)] lg:block"
        />
        <m.div
          aria-hidden
          className="absolute left-0 top-6 hidden h-px origin-left lg:block"
          style={{
            width: "100%",
            scaleX: fillScale,
            background: "linear-gradient(90deg, var(--color-royal), var(--color-eco))",
          }}
        />
        {!reduce && (
          <m.div
            aria-hidden
            className="absolute top-[14px] hidden h-5 w-4 -translate-x-1/2 rounded-[1px] border border-[rgba(0,120,168,0.35)] bg-white shadow-sm lg:block"
            style={{ x: markerX, left: 0 }}
          >
            <div className="mx-auto mt-1 h-2 w-[2px] bg-[color:var(--color-eco)]" />
          </m.div>
        )}
        <m.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map(([n, title, desc]) => (
            <m.div key={n} variants={variants} className="relative">
              <div
                aria-hidden
                className="mb-6 hidden h-3 w-3 rounded-full border border-[rgba(0,120,168,0.4)] bg-white lg:block"
              />
              <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-royal)]">
                {n}
              </div>
              <h3 className="mt-3 font-serif text-[28px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-body)] md:text-[16px]">
                {desc}
              </p>
            </m.div>
          ))}
        </m.div>
      </div>
    </Section>
  );
}

function CTA() {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  return (
    <Section id="contact" deferPaint>
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        className="grid gap-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <m.div variants={variants} className="mb-8">
            <ColorBar className="max-w-[180px]" />
          </m.div>
          <m.div variants={variants}>
            <Eyebrow>Get In Touch</Eyebrow>
          </m.div>
          <m.h2 variants={variants} className="section-title mt-6">
            Got a print or binding{" "}
            <span className="ink-accent italic text-[color:var(--color-royal)]">job</span>{" "}
            in mind?
          </m.h2>
          <m.p
            variants={variants}
            className="mt-6 max-w-xl text-[18px] leading-relaxed text-[color:var(--color-body)]"
          >
            Enquire for bulk orders, corporate runs or a custom print and binding quote.
            We are based in Stafford, Johannesburg.
          </m.p>
        </div>
        <m.div
          variants={variants}
          className="flex flex-col justify-end gap-6 lg:col-span-5 lg:col-start-8"
        >
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${EMAIL}`} className="btn-primary">
              Email Alpine-eco
            </a>
            <a href={`tel:${PHONE_TEL}`} className="btn-ghost">
              Call {PHONE_DISPLAY}
            </a>
          </div>
          <address className="not-italic text-[15px] leading-relaxed text-[color:var(--color-body)] md:text-[16px]">
            {ADDRESS}
          </address>
        </m.div>
      </m.div>
    </Section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="cv-auto border-t border-[rgba(0,120,168,0.14)] bg-white/70 py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ColorBar className="mb-10 max-w-[160px]" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-5">
          <Logo size="footer" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[color:var(--color-body)] md:text-[16px]">
            A Johannesburg printing and book-binding company — notebooks, diaries and
            journals manufactured in-house, from press to spine.
          </p>
        </div>
        <div className="lg:col-span-3 lg:col-start-7">
          <Eyebrow>Explore</Eyebrow>
          <ul className="mt-5 space-y-3 text-[15px] text-[color:var(--color-ink-2)] md:text-[16px]">
            {NAV_LINKS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(id);
                  }}
                  className="gradient-underline transition-colors hover:text-[color:var(--color-royal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <Eyebrow>Contact</Eyebrow>
          <ul className="mt-5 space-y-3 text-[15px] text-[color:var(--color-ink-2)] md:text-[16px]">
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="gradient-underline transition-colors hover:text-[color:var(--color-royal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)]"
              >
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={`tel:${PHONE_TEL}`}
                className="gradient-underline transition-colors hover:text-[color:var(--color-royal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)]"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <address className="not-italic leading-relaxed text-[color:var(--color-body)]">
                {ADDRESS}
              </address>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-7xl border-t border-[rgba(0,120,168,0.10)] px-6 pt-8 sm:px-8 lg:px-12">
        <p className="text-[13px] leading-relaxed tracking-wide text-[color:var(--color-body)]">
          Set in Cormorant Garamond &amp; Inter · Printed &amp; bound in Johannesburg · ©{" "}
          {year} Alpine-eco Notebooks &amp; Diaries
        </p>
        <div className="mt-6">
          <ColorBar className="max-w-[120px]" />
        </div>
      </div>
    </footer>
  );
}

function Index() {
  const heroRef = useRef<HTMLElement | null>(null);
  const sheetsRef = useRef<HTMLDivElement | null>(null);
  const workRef = useRef<HTMLElement | null>(null);
  const motionMode = useDeferredMotionMode();

  return (
    <LazyMotion features={domAnimation}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Suspense fallback={null}>
        {motionMode === "full" ? (
          <LazyMotionLayer
            heroRef={heroRef}
            sheetsRef={sheetsRef as RefObject<HTMLElement | null>}
            workRef={workRef}
          />
        ) : motionMode === "backdrop" ? (
          <LazyMotionBackdrop />
        ) : null}
      </Suspense>
      <div className="relative z-20 isolate min-h-[100dvh] overflow-x-clip bg-transparent">
        <RulerProgress />
        <Nav />
        <main id="main-content">
          <Hero sectionRef={heroRef} />
          <div ref={sheetsRef}>
            <Story />
            <WhatWePrint />
          </div>
          <HowWeWork sectionRef={workRef} />
          <CTA />
        </main>
        <Footer />
      </div>
    </LazyMotion>
  );
}
