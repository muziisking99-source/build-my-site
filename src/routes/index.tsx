import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const EMAIL = "info@alpine-eco.co.za";
const PHONE_DISPLAY = "011 493 0113";
const PHONE_TEL = "+27114930113";
const ADDRESS = "22 Stevens Rd, Stafford, Johannesburg, 2197, South Africa";

const LazyMotionLayer = lazy(() =>
  import("@/components/MotionLayer").then((m) => ({ default: m.MotionLayer })),
);
const LazyMotionBackdrop = lazy(() =>
  import("@/components/MotionLayer").then((m) => ({ default: m.MotionBackdrop })),
);

type MotionMode = "idle" | "backdrop" | "full";

function useDeferredMotionMode(): MotionMode {
  const [mode, setMode] = useState<MotionMode>("idle");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const saveData =
      "connection" in navigator &&
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const next: MotionMode = reduce || mobile || saveData ? "backdrop" : "full";

    const start = () => setMode(next);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 200);
    return () => window.clearTimeout(t);
  }, []);

  return mode;
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

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
      ? "h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-28"
      : size === "footer"
        ? "h-12 w-auto object-contain md:h-14"
        : "h-11 w-auto object-contain md:h-12";

  return (
    <a
      href="#hero"
      onClick={(e) => {
        e.preventDefault();
        scrollTo("hero");
      }}
      className={`inline-flex items-center ${className}`}
      aria-label="Alpine-eco Notebooks & Diaries — home"
    >
      <picture>
        <source srcSet="/alpine-eco-logo.webp" type="image/webp" />
        <img
          src="/alpine-eco-logo.png"
          alt="Alpine-eco Notebooks & Diaries"
          className={sizeClass}
          width={579}
          height={240}
          decoding="async"
        />
      </picture>
    </a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    ["story", "Story"],
    ["print", "What We Print"],
    ["work", "How We Work"],
    ["contact", "Contact"],
  ] as const;
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-white/95 shadow-[0_1px_0_rgba(0,120,168,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-ink-2)] transition-colors hover:text-[color:var(--color-royal)]"
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => scrollTo("contact")}
          className="btn-primary hidden lg:inline-flex"
          style={{ padding: "10px 20px" }}
        >
          Get In Touch
        </button>
      </div>
    </header>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
} as const;

const fadeUpStatic = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
} as const;

function useRevealVariants() {
  const reduce = useReducedMotion();
  return reduce ? fadeUpStatic : fadeUp;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Hero({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const variants = useRevealVariants();
  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden bg-transparent pt-40 pb-32 lg:pt-52 lg:pb-40"
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
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="lg:col-span-7"
        >
          <motion.div variants={variants} className="flex flex-col items-start gap-5">
            <Logo size="hero" />
            <Eyebrow>Alpine-eco · Printing &amp; Book-Binding</Eyebrow>
          </motion.div>
          <motion.h1
            variants={variants}
            className="mt-6 font-serif text-[52px] leading-[1.05] tracking-tight text-[color:var(--color-ink)] md:text-[72px] lg:text-[88px]"
          >
            From the press to the{" "}
            <span className="italic text-[color:var(--color-royal)]">spine.</span>
          </motion.h1>
          <motion.p
            variants={variants}
            className="mt-8 max-w-xl text-[17px] leading-relaxed text-[color:var(--color-body)]"
          >
            Alpine-eco is a Johannesburg printing and book-binding company. We print,
            cut and bind notebooks, diaries and journals in-house — one roof, one
            standard of finish.
          </motion.p>
          <motion.div variants={variants} className="mt-10 flex flex-wrap gap-3">
            <button onClick={() => scrollTo("print")} className="btn-primary">
              What We Print
            </button>
            <button onClick={() => scrollTo("story")} className="btn-ghost">
              Our Story
            </button>
          </motion.div>
        </motion.div>
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
}: {
  id: string;
  children: ReactNode;
  className?: string;
  sectionRef?: RefObject<HTMLElement | null>;
  deferPaint?: boolean;
}) {
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative py-28 lg:py-36 ${deferPaint ? "cv-auto" : ""} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">{children}</div>
    </section>
  );
}

function Story() {
  const variants = useRevealVariants();
  const reduce = useReducedMotion();
  return (
    <Section id="story" deferPaint>
      <div className="grid gap-16 lg:grid-cols-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduce ? 0 : 0.55 }}
          className="lg:col-span-5"
        >
          <Eyebrow>Our Story</Eyebrow>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[56px]">
            A print shop and{" "}
            <span className="italic text-[color:var(--color-royal)]">bindery</span>,
            under one roof.
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
          className="lg:col-span-6 lg:col-start-7"
        >
          <motion.p
            variants={variants}
            className="text-[17px] leading-relaxed text-[color:var(--color-body)]"
          >
            Based in Stafford, Johannesburg, Alpine-eco runs the press and the bindery
            ourselves. Notebooks, diaries and journals are printed, trimmed and bound
            on site — not assembled from outsourced parts.
          </motion.p>
          <motion.p
            variants={variants}
            className="mt-5 text-[17px] leading-relaxed text-[color:var(--color-body)]"
          >
            That is the whole business: accurate colour, clean finishing, and binding
            that holds up to real use — for offices, schools, studios and private
            orders across South Africa.
          </motion.p>
          <motion.ul variants={variants} className="mt-10 space-y-4">
            {[
              "Litho and digital printing, run in-house",
              "Binding and finishing completed under one roof",
              "Hand-checked before every delivery leaves Stafford",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 border-t border-[rgba(0,120,168,0.14)] pt-4 text-[15px] text-[color:var(--color-ink-2)]"
              >
                <span className="mt-2 h-[6px] w-[6px] flex-none rounded-full bg-[color:var(--color-eco)]" />
                <span>{t}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </Section>
  );
}

function WhatWePrint() {
  const items = [
    [
      "Notebooks",
      "Soft and hard cover, ruled or dot-grid — sized for a desk, a bag, or a branded run.",
    ],
    [
      "Diaries",
      "Daily and weekly planners with dated pages, printed and bound for a full year of use.",
    ],
    [
      "Journals",
      "Unlined and lightly ruled pages for notes, sketches and long-form writing.",
    ],
    [
      "Corporate & Custom",
      "Branded diaries and notebooks for teams, clients, schools and year-end gifting.",
    ],
  ] as const;
  const variants = useRevealVariants();
  const reduce = useReducedMotion();
  return (
    <Section id="print" deferPaint>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}
        className="max-w-3xl"
      >
        <motion.div variants={variants}>
          <Eyebrow>What We Print</Eyebrow>
        </motion.div>
        <motion.h2
          variants={variants}
          className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[56px]"
        >
          Notebooks, diaries — printed and bound to order.
        </motion.h2>
        <motion.p
          variants={variants}
          className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[color:var(--color-body)]"
        >
          From a short personal run to a full office order, we manufacture paper goods
          across four areas — printed and bound in Johannesburg.
        </motion.p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map(([title, desc]) => (
          <motion.div
            key={title}
            variants={variants}
            className="card-surface gradient-underline p-7 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-eco-deep)]">
              Alpine-eco
            </div>
            <h3 className="mt-6 font-serif text-[26px] leading-tight tracking-tight text-[color:var(--color-ink)]">
              {title}
            </h3>
            <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--color-body)]">
              {desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
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
  return (
    <Section
      id="work"
      className="bg-[color:var(--color-cream)]/50"
      sectionRef={sectionRef}
      deferPaint
    >
      <div className="grid gap-16 lg:grid-cols-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduce ? 0 : 0.55 }}
          className="lg:col-span-5"
        >
          <Eyebrow>How We Work</Eyebrow>
          <h2 className="mt-6 max-w-md font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[56px]">
            From plates to pages, bound by hand.
          </h2>
        </motion.div>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.08 }}
          className="text-[17px] leading-relaxed text-[color:var(--color-body)] lg:col-span-6 lg:col-start-7"
        >
          We are not a reseller of imported stock. Alpine-eco runs the press and the
          bindery — which means tighter quality control, clearer turnaround, and the
          flexibility to take on genuine custom work.
        </motion.p>
      </div>

      <div className="relative mt-20">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px lg:block"
          style={{
            background: "linear-gradient(90deg, var(--color-royal), var(--color-eco))",
          }}
        />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([n, title, desc], i) => (
            <motion.div
              key={n}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : i * 0.05 }}
              className="relative"
            >
              <div
                aria-hidden
                className="mx-auto mb-6 hidden h-3 w-3 rounded-full border border-[rgba(0,120,168,0.4)] bg-white lg:block"
                style={{ marginLeft: 0 }}
              />
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-royal)]">
                {n}
              </div>
              <h3 className="mt-3 font-serif text-[26px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--color-body)]">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CTA() {
  const variants = useRevealVariants();
  const reduce = useReducedMotion();
  return (
    <Section id="contact" deferPaint>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.div variants={variants}>
          <Eyebrow>Get In Touch</Eyebrow>
        </motion.div>
        <motion.h2
          variants={variants}
          className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[64px]"
        >
          Got a print or binding{" "}
          <span className="italic text-[color:var(--color-royal)]">job</span> in mind?
        </motion.h2>
        <motion.p
          variants={variants}
          className="mt-6 text-[17px] leading-relaxed text-[color:var(--color-body)]"
        >
          Enquire for bulk orders, corporate runs or a custom print and binding quote.
          We are based in Stafford, Johannesburg.
        </motion.p>
        <motion.div variants={variants} className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${EMAIL}`} className="btn-primary">
            Email Alpine-eco
          </a>
          <a href={`tel:${PHONE_TEL}`} className="btn-ghost">
            Call {PHONE_DISPLAY}
          </a>
        </motion.div>
        <motion.p
          variants={variants}
          className="mt-8 text-[13px] leading-relaxed text-[color:var(--color-body)]"
        >
          {ADDRESS}
        </motion.p>
      </motion.div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="cv-auto border-t border-[rgba(0,120,168,0.14)] bg-white/70 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <Logo size="footer" />
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-[color:var(--color-body)]">
            A Johannesburg printing and book-binding company — notebooks, diaries and
            journals manufactured in-house, from press to spine.
          </p>
        </div>
        <div className="lg:col-span-3 lg:col-start-7">
          <div className="eyebrow">Explore</div>
          <ul className="mt-5 space-y-3 text-[14px] text-[color:var(--color-ink-2)]">
            {[
              ["story", "Story"],
              ["print", "What We Print"],
              ["work", "How We Work"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className="transition-colors hover:text-[color:var(--color-royal)]"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <div className="eyebrow">Contact</div>
          <ul className="mt-5 space-y-3 text-[14px] text-[color:var(--color-ink-2)]">
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="transition-colors hover:text-[color:var(--color-royal)]"
              >
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={`tel:${PHONE_TEL}`}
                className="transition-colors hover:text-[color:var(--color-royal)]"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="text-[color:var(--color-body)] leading-relaxed">{ADDRESS}</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-[rgba(0,120,168,0.10)] px-6 pt-6 text-[12px] text-[color:var(--color-body)] sm:flex-row sm:items-center lg:px-10">
        <div>© {new Date().getFullYear()} Alpine-eco Notebooks &amp; Diaries</div>
        <div>Made in South Africa</div>
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
    <>
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
      <div className="relative z-20 isolate min-h-[100dvh] bg-transparent">
        <Nav />
        <main>
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
    </>
  );
}
