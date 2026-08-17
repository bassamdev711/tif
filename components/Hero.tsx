"use client";

import { motion } from "framer-motion";

type HeroData = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroDescription?: string | null
  heroPrimaryButton?: string | null
  heroSecondaryButton?: string | null
}

export default function Hero({ data = {} }: { data?: HeroData }) {
  const scrollToProducts = () => {
    const section = document.getElementById("products");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative w-full min-h-[100dvh] overflow-hidden bg-surface">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      {/* ── DESKTOP LAYOUT (lg and above) ── */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-[100dvh] relative z-10" dir="rtl">

        {/* RIGHT: Text — vertically centered, with padding to clear navbar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col justify-center text-right px-12 xl:px-20 pt-20 pb-16 max-w-xl ml-auto"
        >
          {/* Layer 2: "طيف" — the visual anchor, dominant */}
          <h1 className="text-[6.5rem] xl:text-[7.5rem] font-black text-foreground leading-[0.88] tracking-tight mb-4">
            {data.heroTitle || "طيف"}
          </h1>

          {/* Layer 3: Secondary headline — clearly subordinate to "طيف" */}
          <p className="text-2xl xl:text-3xl font-light text-brand leading-snug tracking-wide mb-10">
            {data.heroSubtitle || "حضورٌ لا يُنسى."}
          </p>

          {/* Layer 4: Description — calm, small, max-width restrained */}
          <p className="text-sm xl:text-base text-foreground/60 font-light leading-loose max-w-sm mb-14 whitespace-pre-line">
            {data.heroDescription || "اكتشف مجموعتنا الحصرية من العطور الفاخرة،\nالمصممة بعناية لتمنحك تجربة حسية تدوم طويلًا."}
          </p>

          {/* Layer 5: CTA Buttons */}
          <div className="flex flex-row gap-4 justify-start">
            <button
              onClick={scrollToProducts}
              className="btn btn-primary btn-lg"
            >
              {data.heroPrimaryButton || "اكتشف المجموعة"}
            </button>
            <button className="btn btn-outline btn-lg">
              {data.heroSecondaryButton || "قصة طيف"}
            </button>
          </div>
        </motion.div>

        {/* LEFT: Bottle — positioned below header with explicit calculated height */}
        <div className="relative flex items-start justify-center overflow-hidden pt-[104px] pb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative w-full max-w-[340px] xl:max-w-[400px] h-[calc(100dvh-128px)]"
          >
            {/* Decorative Frame */}
            <div className="absolute inset-x-4 top-4 bottom-0 border border-accent/20 rounded-t-full pointer-events-none" />

            {/* Green Bottle Container — fills parent, starts at top of padded column */}
            <div className="absolute inset-x-0 top-0 bottom-0 bg-brand rounded-t-full overflow-hidden shadow-2xl flex flex-col items-center justify-center">
              {/* Floating Bottle */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="relative w-[170px] xl:w-[200px] h-[250px] xl:h-[290px] flex flex-col items-center z-10"
              >
                {/* Cap */}
                <div className="w-14 xl:w-16 h-11 xl:h-12 bg-gradient-to-b from-accent via-bottle-cap-light to-bottle-cap-dark rounded-t-xl mb-1 shadow-md z-20" />
                {/* Neck */}
                <div className="w-7 xl:w-8 h-4 bg-accent/80 mb-1 z-20" />
                {/* Bottle Body */}
                <div className="w-full flex-1 bg-gradient-to-b from-bottle-brand-start to-bottle-brand-end rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_20px_30px_rgba(0,0,0,0.4)] flex items-center justify-center relative overflow-hidden border border-white/10">
                  {/* Glass Reflection */}
                  <div className="absolute top-0 left-[-50%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
                  {/* Label */}
                  <div className="w-24 h-24 bg-surface/95 rounded-sm flex flex-col items-center justify-center p-2 shadow-inner border border-accent/20">
                    <span className="text-brand font-black text-2xl">طيف</span>
                    <div className="w-6 h-[1px] bg-accent my-2" />
                    <span className="text-foreground text-[8px] tracking-[0.2em] uppercase text-center leading-tight">EAU DE PARFUM</span>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Typography */}
              <span className="absolute top-1/4 -right-10 text-[12rem] font-serif text-surface/5 rotate-90 select-none pointer-events-none">
                TIF
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (below lg) ── */}
      <div className="flex lg:hidden flex-col min-h-[100dvh] relative z-10 pt-20 sm:pt-24 pb-6 px-5" dir="rtl">

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col text-center w-full max-w-md mx-auto mb-5"
        >
          <h1 className="flex flex-col gap-1 mb-3">
            <span className="text-[2.5rem] sm:text-5xl font-black text-foreground leading-none tracking-tight">
              {data.heroTitle || "طيف"}
            </span>
            <span className="text-xl sm:text-2xl font-light text-brand leading-tight mt-1">
              {data.heroSubtitle || "حضور لا يُنسى."}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-foreground/70 font-light leading-relaxed whitespace-pre-line">
            {data.heroDescription || "اكتشف مجموعتنا الحصرية من العطور الفاخرة، المصممة بعناية فائقة لتمنحك تجربة حسية فريدة تدوم طويلاً."}
          </p>
        </motion.div>

        {/* Bottle */}
        <div className="flex flex-col items-center flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative w-full max-w-[240px] sm:max-w-[300px] h-[250px] sm:h-[340px] flex-shrink-0"
          >
            <div className="absolute inset-x-3 top-3 bottom-0 border border-accent/25 rounded-t-full pointer-events-none" />
            <div className="absolute inset-0 bg-brand rounded-t-full overflow-hidden shadow-2xl flex flex-col items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="relative w-[110px] sm:w-[140px] h-[165px] sm:h-[205px] flex flex-col items-center z-10"
              >
                <div className="w-11 sm:w-13 h-9 sm:h-11 bg-gradient-to-b from-accent via-bottle-cap-light to-bottle-cap-dark rounded-t-xl mb-1 shadow-md z-20" />
                <div className="w-6 sm:w-7 h-3 sm:h-4 bg-accent/80 mb-1 z-20" />
                <div className="w-full flex-1 bg-gradient-to-b from-bottle-brand-start to-bottle-brand-end rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_20px_30px_rgba(0,0,0,0.4)] flex items-center justify-center relative overflow-hidden border border-white/10">
                  <div className="absolute top-0 left-[-50%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-surface/95 rounded-sm flex flex-col items-center justify-center p-2 shadow-inner border border-accent/20">
                    <span className="text-brand font-black text-lg sm:text-xl">طيف</span>
                    <div className="w-5 h-[1px] bg-accent my-1" />
                    <span className="text-foreground text-[7px] tracking-[0.2em] uppercase text-center leading-tight">EAU DE PARFUM</span>
                  </div>
                </div>
              </motion.div>
              <span className="absolute top-1/4 -right-10 text-[7rem] sm:text-[9rem] font-serif text-surface/5 rotate-90 select-none pointer-events-none">TIF</span>
            </div>
          </motion.div>

          {/* Mobile Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-row justify-between gap-2.5 w-full max-w-[240px] sm:max-w-[300px] mt-4"
          >
            <button
              onClick={scrollToProducts}
              className="btn btn-primary flex-1"
            >
              {data.heroPrimaryButton || "اكتشف المجموعة"}
            </button>
            <button className="btn btn-outline flex-1">
              {data.heroSecondaryButton || "قصة طيف"}
            </button>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
