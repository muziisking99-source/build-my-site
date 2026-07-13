import {
  Component,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type SectionRefs = {
  heroRef: RefObject<HTMLElement | null>;
  sheetsRef: RefObject<HTMLElement | null>;
  workRef: RefObject<HTMLElement | null>;
};

/**
 * Fixed CSS-3D motion layer — Book → Sheets → Binding.
 * Always paints BELOW page content (z-0 vs content z-20).
 */
export function MotionLayer(props: SectionRefs) {
  return (
    <MotionErrorBoundary>
      <MotionLayerInner {...props} />
    </MotionErrorBoundary>
  );
}

/** Lightweight CSS-only backdrop for mobile / reduced-motion / save-data. */
export function MotionBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: "paint" }}
    >
      <MotionBackdropLayers />
    </div>
  );
}

function MotionBackdropLayers() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 62% 40%, rgba(255,255,255,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(circle at 1px 1px, rgba(0,120,168,0.07) 1px, transparent 1.35px) 0 0 / 22px 22px",
            "radial-gradient(circle at 1px 1px, rgba(104,184,72,0.055) 1px, transparent 1.35px) 11px 11px / 22px 22px",
          ].join(", "),
          maskImage:
            "radial-gradient(ellipse 68% 62% at 60% 40%, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 68% 62% at 60% 40%, black 25%, transparent 75%)",
        }}
      />
    </>
  );
}

class MotionErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_e: Error, _i: ErrorInfo) {}
  render() {
    if (this.state.failed) return <MotionBackdrop />;
    return this.props.children;
  }
}

/**
 * Cross-fade opacity on a flat 2D wrapper only — never on preserve-3d children.
 * Initialized from progress.get() so deep links / refresh land on the right scene.
 */
function useSceneFade(
  progress: MotionValue<number>,
  fadeIn: [number, number],
  fadeOut: [number, number],
) {
  const sample = (v: number) => {
    if (v <= fadeIn[0]) return 0;
    if (v < fadeIn[1]) return (v - fadeIn[0]) / (fadeIn[1] - fadeIn[0]);
    if (v <= fadeOut[0]) return 1;
    if (v < fadeOut[1]) return 1 - (v - fadeOut[0]) / (fadeOut[1] - fadeOut[0]);
    return 0;
  };
  return useTransform(progress, sample);
}

function SceneShell({
  opacity,
  className,
  children,
  paused,
}: {
  opacity: MotionValue<number>;
  className?: string;
  children: ReactNode;
  paused?: boolean;
}) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const sync = (v: number) => {
      el.style.willChange = v > 0.02 && !paused ? "opacity, transform" : "auto";
    };
    sync(opacity.get());
  }, [opacity, paused]);

  useMotionValueEvent(opacity, "change", (v) => {
    const el = shellRef.current;
    if (!el) return;
    el.style.willChange = v > 0.02 && !paused ? "opacity, transform" : "auto";
  });

  return (
    <motion.div
      ref={shellRef}
      className={className}
      style={{
        opacity: paused ? 0 : opacity,
      }}
    >
      {children}
    </motion.div>
  );
}

function MotionLayerInner({ heroRef, sheetsRef, workRef }: SectionRefs) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: sheetsProgress } = useScroll({
    target: sheetsRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: workProgress } = useScroll({
    target: workRef,
    offset: ["start end", "end start"],
  });

  // Transform-only maps (no per-frame JS easing fns)
  const bookY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : -36]);
  const bookTiltY = useTransform(
    heroProgress,
    [0, 0.8, 1],
    reduce ? [-8, -8, -8] : [-14, -6, -4],
  );
  const bookTiltX = useTransform(
    heroProgress,
    [0, 0.8, 1],
    reduce ? [10, 10, 10] : [12, 10, 8],
  );

  const sheetsY = useTransform(
    sheetsProgress,
    [0.15, 0.85],
    [reduce ? 0 : 36, reduce ? 0 : -56],
  );
  const sheetsRot = useTransform(
    sheetsProgress,
    [0.15, 0.85],
    [reduce ? 0 : 4, reduce ? 0 : -8],
  );

  const bindY = useTransform(
    workProgress,
    [0.2, 0.85],
    [reduce ? 0 : 28, reduce ? 0 : -36],
  );
  const bindRot = useTransform(
    workProgress,
    [0.2, 0.85],
    [reduce ? 0 : -6, reduce ? 0 : 10],
  );

  // Overlapping handoffs — brief cross-fade instead of hard pops
  const bookOpacity = useSceneFade(heroProgress, [-0.01, 0], [0.72, 0.96]);
  const sheetsOpacity = useSceneFade(sheetsProgress, [0.02, 0.12], [0.78, 0.96]);
  const bindOpacity = useSceneFade(workProgress, [0.04, 0.14], [0.8, 0.98]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: "paint" }}
    >
      <MotionBackdropLayers />

      <div
        className="absolute inset-0"
        style={{
          perspective: 1400,
          perspectiveOrigin: "70% 40%",
          transform: "translateZ(0)",
        }}
      >
        {/* BOOK — opacity on flat shell only */}
        <SceneShell
          opacity={bookOpacity}
          paused={paused}
          className="absolute top-[22vh] left-[28%] right-[-8%] flex justify-center sm:top-[18vh] sm:left-[52%] sm:right-0 md:top-[14vh] lg:top-[12vh]"
        >
          <motion.div style={{ y: bookY }}>
            <div className="origin-center scale-[0.52] opacity-90 sm:scale-[0.82] sm:opacity-100 md:scale-[0.95] lg:scale-[1.08]">
              <Notebook tiltX={bookTiltX} tiltY={bookTiltY} />
            </div>
          </motion.div>
        </SceneShell>

        {/* SHEETS */}
        <SceneShell
          opacity={sheetsOpacity}
          paused={paused}
          className="absolute top-[12vh] left-[-6vw] flex w-[min(360px,72vw)] justify-start sm:top-[10vh] sm:left-[1vw] sm:w-[min(480px,46vw)] md:left-[2vw] lg:left-[3vw]"
        >
          <motion.div style={{ y: sheetsY }}>
            <div className="origin-center scale-[0.55] sm:scale-[0.85] md:scale-[1] lg:scale-[1.15]">
              <PaperFan
                progress={sheetsProgress}
                groupRot={sheetsRot}
                reduce={!!reduce}
              />
            </div>
          </motion.div>
        </SceneShell>

        {/* BINDING */}
        <SceneShell
          opacity={bindOpacity}
          paused={paused}
          className="absolute top-[10vh] right-[-4vw] flex w-[min(380px,78vw)] justify-end sm:top-[8vh] sm:right-[1vw] sm:w-[min(520px,48vw)] md:right-[3vw] lg:right-[5vw]"
        >
          <motion.div style={{ y: bindY }}>
            <div className="origin-center scale-[0.58] sm:scale-[0.9] md:scale-[1.05] lg:scale-[1.2]">
              <BookPile rotY={bindRot} />
            </div>
          </motion.div>
        </SceneShell>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Notebook — locked open spread (no hinged covers)
 * Scroll only tilts the whole object so the silhouette stays readable
 * ───────────────────────────────────────────── */

const COVER_BLUE = "#0078A8";
const COVER_DEEP = "#08648F";
const PAGE_CREAM = "#FBF7EF";
const PAGE_RULE = "rgba(13,26,46,0.08)";
const PAGE_MARGIN = "rgba(190, 70, 70, 0.2)";
const ECO_RULE = "rgba(104,184,72,0.55)";

function Notebook({
  tiltX,
  tiltY,
}: {
  tiltX: MotionValue<number> | number;
  tiltY: MotionValue<number> | number;
}) {
  return (
    <motion.div
      style={{
        width: 520,
        height: 340,
        position: "relative",
        transformStyle: "preserve-3d",
        rotateX: tiltX,
        rotateY: tiltY,
        backfaceVisibility: "hidden",
      }}
    >
      {/* Ground shadow — no filter (keeps preserve-3d intact) */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: -10,
          height: 36,
          background:
            "radial-gradient(ellipse at center, rgba(13,26,46,0.22) 0%, transparent 70%)",
          transform: "translateZ(-40px)",
        }}
      />

      {/* Hard-cover base plate (sits just behind the pages) */}
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: 14,
          bottom: 18,
          borderRadius: 10,
          background: `linear-gradient(145deg, ${COVER_DEEP}, ${COVER_BLUE} 55%, #1A8FBE)`,
          boxShadow:
            "0 28px 48px -22px rgba(13,26,46,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          transform: "translateZ(-6px)",
        }}
      />

      {/* Left page — gentle open angle */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 28,
          bottom: 34,
          width: "44%",
          transformOrigin: "right center",
          transform: "rotateY(9deg) translateZ(4px)",
          transformStyle: "preserve-3d",
        }}
      >
        <PageCard side="left" />
      </div>

      {/* Right page */}
      <div
        style={{
          position: "absolute",
          right: 28,
          top: 28,
          bottom: 34,
          width: "44%",
          transformOrigin: "left center",
          transform: "rotateY(-9deg) translateZ(4px)",
          transformStyle: "preserve-3d",
        }}
      >
        <PageCard side="right" />
      </div>

      {/* Spine valley */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 26,
          bottom: 32,
          width: 18,
          marginLeft: -9,
          borderRadius: 9,
          background:
            "linear-gradient(90deg, rgba(13,26,46,0.12), rgba(13,26,46,0.02) 45%, rgba(13,26,46,0.02) 55%, rgba(13,26,46,0.12))",
          transform: "translateZ(8px)",
          pointerEvents: "none",
        }}
      />

      {/* Brand ribbon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 40,
          width: 8,
          height: 150,
          marginLeft: -4,
          background: "linear-gradient(180deg, #8FD06A, #68B848 60%, #4F8F2E)",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
          boxShadow: "1px 6px 12px rgba(13,26,46,0.16)",
          transform: "translateZ(16px)",
        }}
      />
    </motion.div>
  );
}

function PageCard({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: PAGE_CREAM,
        borderRadius: isLeft ? "6px 2px 2px 6px" : "2px 6px 6px 2px",
        boxShadow: isLeft
          ? "6px 14px 28px -14px rgba(13,26,46,0.35), inset -10px 0 18px rgba(13,26,46,0.04)"
          : "-6px 14px 28px -14px rgba(13,26,46,0.35), inset 10px 0 18px rgba(13,26,46,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Margin */}
      <div
        style={{
          position: "absolute",
          top: 44,
          bottom: 28,
          width: 1,
          ...(isLeft ? { left: 48 } : { right: 48 }),
          background: PAGE_MARGIN,
        }}
      />

      {/* Eco header rule */}
      <div
        style={{
          position: "absolute",
          top: 40,
          height: 2,
          borderRadius: 1,
          ...(isLeft ? { left: 22, right: 18 } : { left: 18, right: 22 }),
          background: ECO_RULE,
        }}
      />

      {/* Ruled lines */}
      <div
        style={{
          position: "absolute",
          top: 50,
          bottom: 26,
          ...(isLeft ? { left: 22, right: 18 } : { left: 18, right: 22 }),
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0 18px, ${PAGE_RULE} 18px 19px)`,
        }}
      />

      {/* Cover lip peeking at outer edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 5,
          ...(isLeft ? { left: 0 } : { right: 0 }),
          background: `linear-gradient(180deg, ${COVER_DEEP}, ${COVER_BLUE})`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Paper fan — thick ruled sheets with real depth
 * ───────────────────────────────────────────── */

const FAN = [
  { x: -10, y: 0, z: 0, rx: 8, ry: -16, rz: -11, spread: -48, tint: "#FBF8F0" },
  { x: 28, y: 28, z: 36, rx: -3, ry: 8, rz: 4, spread: 14, tint: "#FDFBF5" },
  { x: -4, y: 64, z: 72, rx: 5, ry: -6, rz: -5, spread: -28, tint: "#F7F3EA" },
] as const;

function PaperFan({
  progress,
  groupRot,
  reduce,
}: {
  progress: MotionValue<number>;
  groupRot: MotionValue<number> | number;
  reduce: boolean;
}) {
  return (
    <motion.div
      style={{
        width: 420,
        height: 480,
        position: "relative",
        transformStyle: "preserve-3d",
        rotateY: groupRot,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: "rotateX(22deg) rotateY(16deg)",
        }}
      >
        {FAN.map((s, i) => (
          <FanSheet key={i} index={i} base={s} progress={progress} reduce={reduce} />
        ))}
      </div>
    </motion.div>
  );
}

function FanSheet({
  index,
  base,
  progress,
  reduce,
}: {
  index: number;
  base: (typeof FAN)[number];
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const x = useTransform(
    progress,
    [0.18, 0.8],
    [base.x, base.x + (reduce ? 0 : base.spread)],
  );
  const z = useTransform(
    progress,
    [0.18, 0.8],
    [base.z, base.z + (reduce ? 0 : 18 + index * 8)],
  );
  const rz = useTransform(
    progress,
    [0.18, 0.8],
    [base.rz, base.rz + (reduce ? 0 : index % 2 === 0 ? 5 : -4)],
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        left: 48,
        top: 24,
        width: 260,
        height: 340,
        x,
        y: base.y,
        z,
        rotateX: base.rx,
        rotateY: base.ry,
        rotateZ: rz,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Paper face — keep paint light for scroll smoothness */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: base.tint,
          border: "1px solid rgba(0,120,168,0.14)",
          borderRadius: 4,
          boxShadow: "0 18px 32px -16px rgba(13,26,46,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Left margin guide */}
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 36,
            bottom: 28,
            width: 1,
            background: "rgba(190, 60, 60, 0.22)",
          }}
        />

        {/* Green header rule */}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 18,
            top: 36,
            height: 2,
            background: "rgba(104,184,72,0.5)",
            borderRadius: 1,
          }}
        />

        {/* Ruled lines */}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 18,
            top: 46,
            bottom: 28,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 17px, rgba(13,26,46,0.07) 17px 18px)",
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * Book pile — thick mini-notebooks with real edges
 * ───────────────────────────────────────────── */

function BookPile({ rotY }: { rotY: MotionValue<number> | number }) {
  const books = [
    {
      x: 0,
      y: 0,
      z: 0,
      rz: -7,
      cover: "linear-gradient(145deg, #006088 0%, #0078A8 55%, #2A9AD0 100%)",
      spine: "#0A0A0A",
      page: "#E8E0D0",
    },
    {
      x: 26,
      y: 56,
      z: 48,
      rz: 5,
      cover: "linear-gradient(145deg, #4F8F2E 0%, #68B848 50%, #88C868 100%)",
      spine: "#2E5A1A",
      page: "#F0EADB",
    },
    {
      x: 12,
      y: 112,
      z: 96,
      rz: -3,
      cover: "linear-gradient(145deg, #FAF7F0 0%, #EDE6D6 100%)",
      spine: "#2A3D55",
      page: "#FDFBF5",
      cream: true,
      stitches: true,
    },
  ] as const;

  return (
    <motion.div
      style={{
        width: 440,
        height: 420,
        position: "relative",
        transformStyle: "preserve-3d",
        rotateY: rotY,
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: "rotateX(28deg) rotateY(-24deg)",
        }}
      >
        {/* Soft pool shadow under the pile */}
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 290,
            width: 300,
            height: 56,
            background:
              "radial-gradient(ellipse at center, rgba(13,26,46,0.28) 0%, transparent 68%)",
            transform: "translateZ(-30px) rotateX(90deg)",
          }}
        />

        {books.map((b, i) => (
          <ThickNotebook key={i} book={b} />
        ))}
      </div>
    </motion.div>
  );
}

function ThickNotebook({
  book,
}: {
  book: {
    x: number;
    y: number;
    z: number;
    rz: number;
    cover: string;
    spine: string;
    page: string;
    cream?: boolean;
    stitches?: boolean;
  };
}) {
  const thickness = 22;

  return (
    <div
      style={{
        position: "absolute",
        left: 64 + book.x,
        top: 40 + book.y,
        width: 280,
        height: 176,
        transformStyle: "preserve-3d",
        transform: `translateZ(${book.z}px) rotateZ(${book.rz}deg)`,
      }}
    >
      {/* Cover face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: book.cover,
          borderRadius: 6,
          border: book.cream ? "1px solid rgba(0,120,168,0.16)" : "none",
          boxShadow:
            "0 28px 48px -20px rgba(13,26,46,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          transform: "translateZ(0px)",
        }}
      />

      {/* Cover linen hint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          opacity: book.cream ? 0.15 : 0.25,
          backgroundImage:
            "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.2) 0.5px, transparent 1px)",
          backgroundSize: "4px 4px",
          pointerEvents: "none",
          transform: "translateZ(0.5px)",
        }}
      />

      {/* Foil rule */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 22,
          bottom: 22,
          width: 2,
          borderRadius: 1,
          background: book.cream
            ? "rgba(0,120,168,0.28)"
            : "rgba(255,255,255,0.35)",
          transform: "translateZ(1px)",
        }}
      />

      {/* Spine face (left) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: thickness,
          height: "100%",
          background: `linear-gradient(90deg, ${book.spine} 0%, #111 100%)`,
          transformOrigin: "left center",
          transform: "rotateY(-90deg)",
          borderRadius: "4px 0 0 4px",
          boxShadow: "inset -2px 0 0 rgba(255,255,255,0.08)",
        }}
      >
        {book.stitches &&
          [0, 1, 2].map((s) => (
            <div
              key={s}
              style={{
                position: "absolute",
                left: 3,
                right: 3,
                top: 28 + s * 46,
                height: 16,
                borderTop: "2.5px solid #68B848",
                borderLeft: "2px solid #68B848",
                borderRight: "2px solid #68B848",
                borderBottom: "none",
                borderRadius: "10px 10px 0 0",
                opacity: 0.95,
              }}
            />
          ))}
      </div>

      {/* Page block (fore-edge) */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 4,
          bottom: 4,
          width: thickness,
          transformOrigin: "right center",
          transform: "rotateY(90deg)",
          background: `repeating-linear-gradient(180deg, ${book.page} 0 2px, #FDFBF5 2px 4px, ${book.page} 4px 6px)`,
          boxShadow: "inset 0 0 0 1px rgba(13,26,46,0.08)",
          borderRadius: 1,
        }}
      />

      {/* Bottom edge (thickness) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: thickness,
          transformOrigin: "bottom center",
          transform: "rotateX(-90deg)",
          background: book.cream
            ? "linear-gradient(180deg, rgba(13,26,46,0.12), rgba(13,26,46,0.22))"
            : "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.4))",
        }}
      />

      {/* Top edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: thickness,
          transformOrigin: "top center",
          transform: "rotateX(90deg)",
          background: book.cream
            ? "linear-gradient(0deg, rgba(255,255,255,0.5), rgba(13,26,46,0.08))"
            : "linear-gradient(0deg, rgba(255,255,255,0.15), rgba(0,0,0,0.25))",
        }}
      />
    </div>
  );
}
