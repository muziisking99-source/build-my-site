import {
  Component,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
} from "react";
import {
  motion,
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
      style={{ contain: "strict" }}
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
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function easeOut(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) * (1 - c);
}

function MotionLayerInner({ heroRef, sheetsRef, workRef }: SectionRefs) {
  const reduce = useReducedMotion();

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

  const bookOpacity = useTransform(heroProgress, [0, 0.6, 0.9, 1], [1, 1, 0.15, 0]);
  const bookY = useTransform(heroProgress, [0, 1], [0, -40]);
  const bookVisibility = useTransform(bookOpacity, (v) =>
    v < 0.02 ? "hidden" : "visible",
  );

  // Open while hero is on screen: -65° → -12° / 65° → 12°
  const leftRot = useTransform(heroProgress, (v: number) => {
    if (reduce) return -14;
    return -65 + easeOut(Math.min(1, v / 0.7)) * 53;
  });
  const rightRot = useTransform(heroProgress, (v: number) => {
    if (reduce) return 14;
    return 65 - easeOut(Math.min(1, v / 0.7)) * 53;
  });

  const sheetsOpacity = useTransform(
    sheetsProgress,
    [0.1, 0.24, 0.7, 0.86],
    [0, 1, 1, 0],
  );
  const sheetsY = useTransform(sheetsProgress, [0.15, 0.85], [36, -56]);
  const sheetsRot = useTransform(sheetsProgress, [0.15, 0.85], [4, -8]);
  const sheetsVisibility = useTransform(sheetsOpacity, (v) =>
    v < 0.02 ? "hidden" : "visible",
  );

  const bindOpacity = useTransform(
    workProgress,
    [0.12, 0.3, 0.72, 0.9],
    [0, 1, 1, 0],
  );
  const bindY = useTransform(workProgress, [0.2, 0.85], [28, -36]);
  const bindRot = useTransform(workProgress, [0.2, 0.85], [-6, 10]);
  const bindVisibility = useTransform(bindOpacity, (v) =>
    v < 0.02 ? "hidden" : "visible",
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: "strict" }}
    >
      <MotionBackdropLayers />

      <div
        className="absolute inset-0"
        style={{ perspective: 1400, perspectiveOrigin: "70% 40%" }}
      >
        {/* BOOK — locked to the right half so it never covers hero copy */}
        <motion.div
          className="absolute top-[18vh] left-[52%] right-0 flex justify-center md:top-[14vh] lg:top-[12vh]"
          style={{
            opacity: bookOpacity,
            y: reduce ? 0 : bookY,
            visibility: bookVisibility,
          }}
        >
          <div className="origin-top scale-[0.55] sm:scale-[0.7] md:scale-[0.85] lg:scale-100">
            <Notebook leftRot={leftRot} rightRot={rightRot} />
          </div>
        </motion.div>

        {/* SHEETS — left side, bigger + clearer 3D paper */}
        <motion.div
          className="absolute top-[10vh] left-[1vw] hidden w-[min(480px,46vw)] justify-start sm:flex md:left-[2vw] lg:left-[3vw]"
          style={{
            opacity: sheetsOpacity,
            y: reduce ? 0 : sheetsY,
            visibility: sheetsVisibility,
          }}
        >
          <div className="origin-center scale-[0.85] md:scale-[1] lg:scale-[1.15]">
            <PaperFan
              progress={sheetsProgress}
              groupRot={reduce ? 0 : sheetsRot}
              reduce={!!reduce}
            />
          </div>
        </motion.div>

        {/* BINDING — far right, clear of "bound by hand" headline */}
        <motion.div
          className="absolute top-[8vh] right-[1vw] hidden w-[min(520px,48vw)] justify-end sm:flex md:right-[3vw] lg:right-[5vw]"
          style={{
            opacity: bindOpacity,
            y: reduce ? 0 : bindY,
            visibility: bindVisibility,
          }}
        >
          <div className="origin-center scale-[0.9] md:scale-[1.05] lg:scale-[1.2]">
            <BookPile rotY={reduce ? 0 : bindRot} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Notebook — one product, contained open
 * Covers only; pages are a fixed wedge between them (no flying leaves)
 * ───────────────────────────────────────────── */

const BLUE =
  "linear-gradient(150deg, #006088 0%, #0078A8 45%, #2A9AD0 100%)";

function Notebook({
  leftRot,
  rightRot,
}: {
  leftRot: MotionValue<number>;
  rightRot: MotionValue<number>;
}) {
  return (
    <div
      style={{
        width: 420,
        height: 300,
        position: "relative",
        transformStyle: "preserve-3d",
        transform: "rotateX(20deg) rotateY(-18deg)",
      }}
    >
      {/* Ground shadow */}
      <div
        style={{
          position: "absolute",
          left: "15%",
          right: "15%",
          bottom: -14,
          height: 24,
          background:
            "radial-gradient(ellipse, rgba(13,26,46,0.22) 0%, transparent 70%)",
          transform: "translateZ(-24px)",
        }}
      />

      {/* Static page block (center) — stays put, covers open around it */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          top: 14,
          bottom: 14,
          transformStyle: "preserve-3d",
          transform: "translateZ(1px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "#F7F3EA",
            borderRadius: 3,
            boxShadow: "0 12px 28px -16px rgba(13,26,46,0.35)",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, borderRight: "1px solid rgba(13,26,46,0.06)", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 12,
                top: 28,
                bottom: 16,
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 15px, rgba(13,26,46,0.07) 15px 16px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 12,
                top: 22,
                height: 1.5,
                background: "rgba(104,184,72,0.4)",
              }}
            />
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 12,
                right: 16,
                top: 28,
                bottom: 16,
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 15px, rgba(13,26,46,0.07) 15px 16px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 12,
                right: 16,
                top: 22,
                height: 1.5,
                background: "rgba(104,184,72,0.4)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Spine */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 18,
          marginLeft: -9,
          background:
            "linear-gradient(90deg, #0A0A0A, #4F8F2E 28%, #68B848 50%, #006088 72%, #0A0A0A)",
          borderRadius: 2,
          transform: "translateZ(6px)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
          zIndex: 3,
        }}
      />

      {/* Left cover */}
      <Cover side="left" rotateY={leftRot} />
      {/* Right cover */}
      <Cover side="right" rotateY={rightRot} />

      {/* Ribbon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 8,
          width: 8,
          height: 200,
          marginLeft: -4,
          background: "linear-gradient(180deg, #88C868, #4F8F2E)",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
          transform: "translateZ(10px)",
          zIndex: 4,
        }}
      />
    </div>
  );
}

function Cover({
  side,
  rotateY,
}: {
  side: "left" | "right";
  rotateY: MotionValue<number>;
}) {
  const isLeft = side === "left";
  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "50%",
        ...(isLeft ? { left: 0 } : { right: 0 }),
        transformOrigin: isLeft ? "right center" : "left center",
        transformStyle: "preserve-3d",
        rotateY,
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: BLUE,
          borderRadius: isLeft ? "10px 1px 1px 10px" : "1px 10px 10px 1px",
          boxShadow:
            "0 24px 40px -20px rgba(13,26,46,0.45), inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      />
      {/* thickness */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 10,
          ...(isLeft ? { left: 0 } : { right: 0 }),
          background: "#006088",
          transformOrigin: isLeft ? "left center" : "right center",
          transform: isLeft
            ? "rotateY(-90deg) translateX(-10px)"
            : "rotateY(90deg) translateX(10px)",
        }}
      />
      {/* foil */}
      <div
        style={{
          position: "absolute",
          top: 28,
          bottom: 28,
          width: 2,
          ...(isLeft ? { right: 14 } : { left: 14 }),
          background: "rgba(255,255,255,0.3)",
          transform: "translateZ(1px)",
        }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * Paper fan — thick ruled sheets with real depth
 * ───────────────────────────────────────────── */

const FAN = [
  { x: -10, y: 0, z: 0, rx: 8, ry: -16, rz: -11, spread: -48, tint: "#FBF8F0" },
  { x: 28, y: 28, z: 36, rx: -3, ry: 8, rz: 4, spread: 14, tint: "#FDFBF5" },
  { x: -4, y: 64, z: 72, rx: 5, ry: -6, rz: -5, spread: -28, tint: "#F7F3EA" },
  { x: 40, y: 108, z: 110, rx: -2, ry: 12, rz: 10, spread: 52, tint: "#FDFBF5" },
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
        {/* Ground contact */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 360,
            width: 280,
            height: 40,
            background:
              "radial-gradient(ellipse at center, rgba(13,26,46,0.18) 0%, transparent 70%)",
            transform: "translateZ(-40px) rotateX(90deg)",
          }}
        />
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
  const enter = 0.12 + index * 0.05;
  const opacity = useTransform(
    progress,
    [enter, enter + 0.12, 0.68, 0.84],
    [0, 1, 1, 0],
  );
  const driftX = useTransform(progress, [0.18, 0.8], [0, reduce ? 0 : base.spread]);
  const driftZ = useTransform(progress, [0.18, 0.8], [0, reduce ? 0 : 18 + index * 8]);
  const driftRz = useTransform(
    progress,
    [0.18, 0.8],
    [0, reduce ? 0 : (index % 2 === 0 ? 5 : -4)],
  );

  const x = useTransform(driftX, (d) => base.x + d);
  const z = useTransform(driftZ, (d) => base.z + d);
  const rz = useTransform(driftRz, (d) => base.rz + d);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: 48,
        top: 24,
        width: 260,
        height: 340,
        opacity,
        x,
        y: base.y,
        z,
        rotateX: base.rx,
        rotateY: base.ry,
        rotateZ: rz,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Paper face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: base.tint,
          border: "1px solid rgba(0,120,168,0.14)",
          borderRadius: 4,
          boxShadow:
            "0 28px 44px -18px rgba(13,26,46,0.42), inset 0 0 0 1px rgba(255,255,255,0.4)",
          overflow: "hidden",
        }}
      >
        {/* Paper grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.45,
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(13,26,46,0.04) 0.6px, transparent 1px)",
            backgroundSize: "5px 5px",
            pointerEvents: "none",
          }}
        />

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

        {/* Ruled field */}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 18,
            top: 52,
            bottom: 28,
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 19px, rgba(13,26,46,0.09) 19px, rgba(13,26,46,0.09) 20px)",
          }}
        />

        {/* Hole punches */}
        {[0, 1, 2].map((h) => (
          <div
            key={h}
            style={{
              position: "absolute",
              left: 14,
              top: 70 + h * 90,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "rgba(13,26,46,0.06)",
              boxShadow: "inset 0 1px 2px rgba(13,26,46,0.15)",
            }}
          />
        ))}

        {/* Folded corner */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "0 0 28px 28px",
            borderColor: "transparent transparent #E8E2D4 transparent",
            filter: "drop-shadow(-1px -1px 1px rgba(13,26,46,0.08))",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "28px 28px 0 0",
            borderColor: "#F0EBE0 transparent transparent transparent",
            opacity: 0.9,
          }}
        />
      </div>

      {/* Paper thickness edge */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 2,
          bottom: 2,
          width: 8,
          transformOrigin: "right center",
          transform: "rotateY(90deg)",
          background: "linear-gradient(90deg, #EDE6D6, #F7F3EA)",
          boxShadow: "inset 0 0 0 1px rgba(13,26,46,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 2,
          right: 2,
          bottom: 0,
          height: 6,
          transformOrigin: "bottom center",
          transform: "rotateX(-90deg)",
          background: "rgba(13,26,46,0.1)",
        }}
      />
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
