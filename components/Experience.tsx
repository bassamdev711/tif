"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

type ExperienceData = {
  expTopTitle?: string | null
  expMainTitle?: string | null
  expBox1Title?: string | null
  expBox1Desc?: string | null
  expBox2Title?: string | null
  expBox2Desc?: string | null
}

export default function Experience({ data = {} }: { data?: ExperienceData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section id="experience" className="relative py-32 bg-white overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="text-accent tracking-[0.4em] uppercase text-xs font-bold mb-4 block">
            {data.expTopTitle || "The Philosophy of Light"}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">{data.expMainTitle || "تجربة طيف"}</h2>
          <div className="w-12 h-[2px] bg-brand mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div style={{ y: y1 }} className="space-y-12">
            <div className="bg-surface p-8 md:p-12 border-r-2 border-brand shadow-sm">
              <h3 className="text-2xl text-foreground mb-4 font-black">{data.expBox1Title || "الضوء والبلور"}</h3>
              <p className="text-foreground/70 leading-relaxed font-light text-lg">
                {data.expBox1Desc || "نحن لا نصنع عطوراً فحسب، بل نلتقط الضوء في زجاجات كريستالية. كل قطرة تعكس نقاء الروح وتضيء العتمة، لتخلق هالة من السحر حول من يرتديها."}
              </p>
            </div>
            
            <div className="bg-surface p-8 md:p-12 border-l-2 border-accent shadow-sm md:mr-12">
              <h3 className="text-2xl text-foreground mb-4 font-black">{data.expBox2Title || "الصفاء المطلق"}</h3>
              <p className="text-foreground/70 leading-relaxed font-light text-lg">
                {data.expBox2Desc || "مكوناتنا مستخلصة من أندر زهور الأرض، ممتزجة مع نسمات الهواء الباردة وقطرات الندى، لتعطي إحساساً بالبرودة والانتعاش الفاخر."}
              </p>
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="relative h-[600px] w-full hidden md:block">
            <div className="absolute inset-0 border border-accent/30 translate-x-4 translate-y-4"></div>
            <div className="absolute inset-0 overflow-hidden shadow-2xl bg-surface p-4">
              <div className="relative w-full h-full">
                <Image
                  src="/imeg/photo_3_2026-05-13_05-39-00.jpg"
                  alt="Experience"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-brand/10 mix-blend-overlay"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
