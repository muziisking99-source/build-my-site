import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MotionLayer } from "@/components/MotionLayer";

export const Route = createFileRoute("/")({
  component: Index,
});

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden>
        <path d="M6 28 Q20 10 34 28" stroke="#1B3FBE" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="10" y="24" width="20" height="10" rx="1" fill="#1B3FBE" />
        <line x1="20" y1="24" x2="20" y2="34" stroke="#F4F7F2" strokeWidth="1" />
        <circle cx="20" cy="14" r="2" fill="#1E9E5E" />
      </svg>
      <span className="font-serif text-[19px] leading-none tracking-tight text-[color:var(--color-ink)]">
        Alpine-<span className="italic text-[color:var(--color-eco-deep)]">eco</span>
      </span>
    </div>
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-sm shadow-[0_1px_0_rgba(27,63,190,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
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
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-32 lg:pt-52 lg:pb-40">
      {/* diagonal off-white panel */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 hidden md:block"
        style={{
          width: "52%",
          background: "var(--color-cream)",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 4% 100%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="lg:col-span-7"
        >
          <motion.div variants={fadeUp}>
            <Eyebrow>Alpine-Eco Notebooks &amp; Diaries</Eyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-serif text-[52px] leading-[1.05] tracking-tight text-[color:var(--color-ink)] md:text-[72px] lg:text-[88px]"
          >
            From the press to the{" "}
            <span className="italic text-[color:var(--color-royal)]">spine.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-xl text-[17px] leading-relaxed text-[color:var(--color-body)]"
          >
            Alpine-Eco is a printing and book-binding company. We manufacture notebooks
            and diaries in-house, from the first printed sheet to the finished, bound
            cover.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
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
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-28 lg:py-36 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">{children}</div>
    </section>
  );
}

function Story() {
  return (
    <Section id="story">
      <div className="grid gap-16 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5"
        >
          <Eyebrow>Our Story</Eyebrow>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[56px]">
            A print shop,{" "}
            <span className="italic text-[color:var(--color-royal)]">first</span> and
            foremost.
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="lg:col-span-6 lg:col-start-7"
        >
          <motion.p
            variants={fadeUp}
            className="text-[17px] leading-relaxed text-[color:var(--color-body)]"
          >
            Alpine-Eco is a printing and book-binding company. We manufacture
            notebooks, diaries and journals in-house — printed on our own presses, cut,
            and bound under one roof.
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-[17px] leading-relaxed text-[color:var(--color-body)]"
          >
            That's the whole business: precision printing and proper binding, done at
            scale, for brands and individuals who need it done right.
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-10 space-y-4">
            {[
              "Printed and bound entirely in-house, start to finish",
              "Every run checked by hand before it ships",
              "Trusted by offices, schools and studios across South Africa",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 border-t border-[rgba(27,63,190,0.13)] pt-4 text-[15px] text-[color:var(--color-ink-2)]"
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
    ["Notebooks", "Soft and hard cover, ruled or dot-grid, sized for a desk drawer or a bag."],
    ["Diaries", "Daily and weekly planners with dated pages, built for a year of real use."],
    ["Journals", "Unlined pages for the people who think better with a pen in hand."],
    ["Corporate & Custom", "Branded diaries and notebooks for teams, clients and year-end gifting."],
  ] as const;
  return (
    <Section id="print">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="max-w-3xl"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>What We Print</Eyebrow>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[56px]"
        >
          Notebooks, diaries — and anything in between.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[color:var(--color-body)]"
        >
          We manufacture paper goods across four areas — from a single notebook to a
          branded print run for an entire office.
        </motion.p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map(([title, desc]) => (
          <motion.div
            key={title}
            variants={fadeUp}
            className="card-surface gradient-underline p-7 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-eco-deep)]">
              Alpine-Eco
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

function HowWeWork() {
  const steps = [
    ["01", "Print", "Litho and digital printing, run in-house for full control over quality and colour."],
    ["02", "Cut", "Every sheet trimmed and squared to size before it goes anywhere near a binder."],
    ["03", "Bind", "Perfect, saddle-stitch or casebound — whatever the job calls for."],
    ["04", "Finish & Check", "Every run checked by hand before it ships — no shortcuts, no guesswork."],
  ] as const;
  return (
    <Section id="work" className="bg-[color:var(--color-cream)]/50">
      <div className="grid gap-16 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5"
        >
          <Eyebrow>How We Work</Eyebrow>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[56px]">
            From plates to pages, bound by hand.
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[17px] leading-relaxed text-[color:var(--color-body)] lg:col-span-6 lg:col-start-7"
        >
          Alpine-Eco isn't just a notebook brand — we run the press and the bindery
          ourselves. That means tighter quality control, faster turnaround, and the
          flexibility to do genuinely custom runs.
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
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="relative"
            >
              <div
                aria-hidden
                className="mx-auto mb-6 hidden h-3 w-3 rounded-full border border-[rgba(27,63,190,0.4)] bg-white lg:block"
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
  return (
    <Section id="contact">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>Get In Touch</Eyebrow>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[64px]"
        >
          Got a print or binding{" "}
          <span className="italic text-[color:var(--color-royal)]">job</span> in mind?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-[17px] leading-relaxed text-[color:var(--color-body)]"
        >
          Get in touch for stockist information, bulk orders or a custom print and
          binding quote.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10">
          <a href="mailto:hello@alpine-eco.co.za" className="btn-primary">
            Contact Alpine-Eco
          </a>
        </motion.div>
      </motion.div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[rgba(27,63,190,0.13)] bg-white/70 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-[color:var(--color-body)]">
            A printing and book-binding company — we manufacture notebooks and diaries
            in-house, from press to spine.
          </p>
        </div>
        <div className="lg:col-span-3 lg:col-start-7">
          <div className="eyebrow">Explore</div>
          <ul className="mt-5 space-y-3 text-[14px] text-[color:var(--color-ink-2)]">
            {[
              ["story", "Story"],
              ["print", "What We Print"],
              ["work", "How We Work"],
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
                href="mailto:hello@alpine-eco.co.za"
                className="transition-colors hover:text-[color:var(--color-royal)]"
              >
                hello@alpine-eco.co.za
              </a>
            </li>
            <li className="text-[color:var(--color-body)]">Stockists &amp; bulk orders</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-[rgba(27,63,190,0.10)] px-6 pt-6 text-[12px] text-[color:var(--color-body)] sm:flex-row sm:items-center lg:px-10">
        <div>© {new Date().getFullYear()} Alpine-Eco Notebooks &amp; Diaries</div>
        <div>Made in South Africa</div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen bg-white">
      <MotionLayer />
      <Nav />
      <main>
        <Hero />
        <Story />
        <WhatWePrint />
        <HowWeWork />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
