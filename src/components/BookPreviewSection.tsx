import { useState } from 'react';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import {
  CHAPTER_TOPIC_CARDS,
  THIRTY_DAY_PHASES,
  TRANSFORMATION_PILLARS,
} from '../data/ebookContent';

interface BookPreviewSectionProps {
  onOpenPdfModal: () => void;
}

export function BookPreviewSection({ onOpenPdfModal }: BookPreviewSectionProps) {
  const [activePhaseId, setActivePhaseId] = useState<'week1' | 'week2' | 'week3' | 'week4'>('week1');

  const activePhase =
    THIRTY_DAY_PHASES.find((phase) => phase.id === activePhaseId) || THIRTY_DAY_PHASES[0];

  return (
    <div className="bg-[#060b10] text-stone-100">
      {/* Section A: Problem -> Solution System (Original Value Framework, Not Book Ingredients) */}
      <section id="why-keto" className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-wide text-emerald-400">
              Built for Real Results · لماذا ينجح هذا النظام؟
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
              Four Roadblocks Stopping Weight Loss — And How This Book Solves Them
            </h2>
          </div>
          <p className="text-sm text-stone-400 max-w-md leading-relaxed">
            Most diets fail from complexity, not lack of effort. Here is the practical framework
            inside the KetoLife Bahrain guide before you unlock the full recipes and plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRANSFORMATION_PILLARS.map((pillar) => (
            <article
              key={pillar.number}
              className="bg-[#0b131b] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5 hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold text-amber-300 tabular-nums">
                    Problem {pillar.number}
                  </span>
                  <span className="font-arabic text-xs text-emerald-300">{pillar.solutionAr}</span>
                </div>
                <p className="text-sm font-medium text-stone-400 line-through decoration-rose-400/60">
                  {pillar.problemTitle}
                </p>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pillar.solutionTitle}</span>
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed">{pillar.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section B: 30-Day Transformation Roadmap + Chapter Topics Overview */}
      <section id="inside-guide" className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-wide text-emerald-400">
              4-Week Momentum Journey · رحلة التغيير في ٣٠ يوماً
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
              Your 30-Day Transformation Roadmap
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              Explore what changes across each week of the 30-day system and the bilingual chapter
              topics unlocked when you download the complete 24-page eBook.
            </p>
          </div>

          <button
            onClick={onOpenPdfModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0e1720] hover:bg-[#152230] border border-white/15 rounded-lg text-sm font-medium text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start lg:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>View Book Cover &amp; Topics</span>
          </button>
        </div>

        {/* Interactive Week 1–4 Milestone Explorer */}
        <div className="bg-[#0b131b] border border-white/10 rounded-2xl p-6 sm:p-8 mb-10 space-y-6">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
            {THIRTY_DAY_PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activePhaseId === phase.id
                    ? 'bg-emerald-500 text-stone-950 font-semibold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {phase.tabLabel}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono font-semibold text-amber-300 tabular-nums">
                  {activePhase.daysLabel}
                </span>
                <span aria-hidden="true" className="text-stone-600">
                  ·
                </span>
                <span className="font-arabic text-emerald-300">{activePhase.titleAr}</span>
              </div>
              <h3 className="text-2xl font-semibold text-white">{activePhase.titleEn}</h3>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                {activePhase.summary}
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#060b10] border border-white/10 rounded-xl p-5 space-y-3">
              <p className="text-xs font-semibold text-emerald-400">Key Focus Milestones</p>
              <ul className="space-y-2.5">
                {activePhase.milestones.map((milestone) => (
                  <li key={milestone} className="flex items-start gap-2.5 text-sm text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Clean Chapter Topics Overview (Zero Leaked Meal Tables or Exercises) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Topics Unlocked Inside the Full 24-Page Bilingual eBook
            </h3>
            <span className="font-arabic text-xs text-emerald-300">محتويات الكتاب الكامل</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CHAPTER_TOPIC_CARDS.map((card) => (
              <div
                key={card.titleEn}
                className="bg-[#0b131b] border border-white/10 rounded-xl p-5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-amber-300 tabular-nums">{card.pages}</span>
                  <span className="font-arabic text-emerald-300">{card.titleAr}</span>
                </div>
                <h4 className="text-base font-semibold text-white">{card.titleEn}</h4>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{card.scope}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
