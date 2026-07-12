import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Fixed full-viewport scroll-driven CSS-3D motion layer.
 * Three objects cross-fade based on document scroll progress:
 *   0.00 - 0.28  Book (hero)
 *   0.22 - 0.62  Cascading sheets (story / what we print)
 *   0.58 - 0.92  Binding detail (how we work)
 */
export function MotionLayer() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Book — visible early, fades out by ~28%
  const bookOpacity = useTransform(scrollYProgress, [0, 0.05, 0.22, 0.3], [0, 1, 1, 0]);
  const bookLeftRot = useTransform(scrollYProgress, [0, 0.28], [-70, -8]);
  const bookRightRot = useTransform(scrollYProgress, [0, 0.28], [70, 8]);
  const bookY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  // Sheets — story + what we print
  const sheetsOpacity = useTransform(
    scrollYProgress,
    [0.2, 0.3, 0.55, 0.65],
    [0, 1, 1, 0],
  );
  const sheetsRot = useTransform(scrollYProgress, [0.2, 0.65], [0, 22]);
  const sheetsY = useTransform(scrollYProgress, [0.2, 0.65], [40, -80]);

  // Binding — how we work
  const bindOpacity = useTransform(
    scrollYProgress,
    [0.55, 0.65, 0.88, 0.96],
    [0, 1, 1, 0],
  );
  const bindRot = useTransform(scrollYProgress, [0.55, 0.96], [-12, 6]);
  const bindY = useTransform(scrollYProgress, [0.55, 0.96], [40, -40]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ perspective: "1400px" }}
    >
      {/* halftone dots */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 1px 1px, rgba(27,63,190,0.10) 1px, transparent 1.6px) 0 0/22px 22px, radial-gradient(circle at 1px 1px, rgba(30,158,94,0.08) 1px, transparent 1.6px) 8px 8px/22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 45%, transparent 85%)",
        }}
      />
      {/* cutting mat grid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(27,63,190,0.05) 0 1px, transparent 1px 80px), repeating-linear-gradient(90deg, rgba(27,63,190,0.05) 0 1px, transparent 1px 80px)",
        }}
      />

      {/* Object 1 — Book */}
      <motion.div
        className="absolute top-[18vh] right-[6vw] hidden md:block"
        style={{
          opacity: bookOpacity,
          y: reduce ? 0 : bookY,
          transformStyle: "preserve-3d",
          width: 420,
          height: 300,
        }}
      >
        <div className="relative" style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}>
          {/* spine */}
          <div
            className="absolute left-1/2 top-0 h-full"
            style={{
              width: 14,
              transform: "translateX(-50%)",
              background: "linear-gradient(180deg, #0D1A2E, #122E9A)",
              borderRadius: 2,
            }}
          />
          {/* left cover */}
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{
              width: "50%",
              transformOrigin: "right center",
              rotateY: reduce ? -8 : bookLeftRot,
              background: "linear-gradient(135deg, #122E9A, #3D5FD4)",
              borderRadius: "6px 2px 2px 6px",
              boxShadow: "0 20px 40px -20px rgba(13,26,46,0.4)",
            }}
          >
            <div
              className="absolute inset-2"
              style={{ background: "#F4F7F2", borderRadius: 3, transform: "translateZ(4px)" }}
            />
          </motion.div>
          {/* right cover */}
          <motion.div
            className="absolute top-0 right-0 h-full"
            style={{
              width: "50%",
              transformOrigin: "left center",
              rotateY: reduce ? 8 : bookRightRot,
              background: "linear-gradient(135deg, #1E9E5E, #2ECC8A)",
              borderRadius: "2px 6px 6px 2px",
              boxShadow: "0 20px 40px -20px rgba(13,26,46,0.4)",
            }}
          >
            <div
              className="absolute inset-2"
              style={{ background: "#F4F7F2", borderRadius: 3, transform: "translateZ(4px)" }}
            />
          </motion.div>
          {/* ribbon */}
          <div
            className="absolute left-1/2 top-2"
            style={{
              width: 6,
              height: 220,
              transform: "translateX(-50%) translateZ(2px)",
              background: "linear-gradient(180deg, #2ECC8A, #177A4A)",
              borderRadius: 1,
            }}
          />
        </div>
      </motion.div>

      {/* Object 2 — Cascading sheets */}
      <motion.div
        className="absolute top-[30vh] left-[6vw] hidden md:block"
        style={{
          opacity: sheetsOpacity,
          y: reduce ? 0 : sheetsY,
          rotate: reduce ? 0 : sheetsRot,
          transformStyle: "preserve-3d",
          width: 360,
          height: 380,
        }}
      >
        {[
          { x: 0, y: 0, r: -8, z: 0 },
          { x: 40, y: 30, r: 6, z: 20 },
          { x: -20, y: 70, r: -3, z: 40 },
          { x: 50, y: 110, r: 10, z: 60 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: 240,
              height: 320,
              left: 40,
              top: 20,
              transform: `translate3d(${s.x}px, ${s.y}px, ${s.z}px) rotate(${s.r}deg)`,
              background:
                "linear-gradient(#FDFBF5, #F4F1E8), repeating-linear-gradient(0deg, transparent 0 22px, rgba(13,26,46,0.06) 22px 23px)",
              backgroundBlendMode: "multiply",
              border: "1px solid rgba(27,63,190,0.08)",
              borderRadius: 3,
              boxShadow: "0 18px 30px -22px rgba(13,26,46,0.4)",
            }}
          />
        ))}
      </motion.div>

      {/* Object 3 — Binding detail */}
      <motion.div
        className="absolute top-[35vh] right-[8vw] hidden md:block"
        style={{
          opacity: bindOpacity,
          y: reduce ? 0 : bindY,
          rotate: reduce ? 0 : bindRot,
          transformStyle: "preserve-3d",
          width: 340,
          height: 300,
        }}
      >
        {[
          { c: "linear-gradient(135deg, #122E9A, #3D5FD4)", y: 0, r: -6 },
          { c: "linear-gradient(135deg, #1E9E5E, #2ECC8A)", y: 28, r: 4 },
          { c: "linear-gradient(135deg, #F4F7F2, #E7E1D0)", y: 56, r: -2 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: 20,
              top: 20 + p.y,
              width: 280,
              height: 60,
              background: p.c,
              borderRadius: 3,
              transform: `rotate(${p.r}deg)`,
              boxShadow: "0 14px 28px -20px rgba(13,26,46,0.4)",
            }}
          />
        ))}
        {/* stitches */}
        {[0, 1, 2].map((i) => (
          <div
            key={`s${i}`}
            className="absolute"
            style={{
              left: 60 + i * 90,
              top: 210,
              width: 40,
              height: 12,
              border: "2px solid #1E9E5E",
              borderBottom: "none",
              borderRadius: "40px 40px 0 0",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
