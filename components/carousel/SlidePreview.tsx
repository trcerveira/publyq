"use client";

import type { CarouselSlide } from "@/lib/supabase/types";

interface Props {
  slide: CarouselSlide;
  brandColors: {
    bg: string;
    text: string;
    accent: string;
  };
  imageUrl?: string;
  isFirst?: boolean;
  isLast?: boolean;
  totalSlides: number;
}

export default function SlidePreview({ slide, brandColors, imageUrl, isFirst, isLast, totalSlides }: Props) {
  return (
    <div
      id={`slide-${slide.slideNumber}`}
      className="relative w-[320px] h-[320px] rounded-xl overflow-hidden flex-shrink-0 border border-white/10"
      style={{ backgroundColor: brandColors.bg }}
    >
      {/* Background image with overlay */}
      {imageUrl && (
        <>
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${brandColors.bg}CC` }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Slide number */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-mono opacity-40"
            style={{ color: brandColors.text }}
          >
            {isFirst ? "HOOK" : isLast ? "CTA" : `${slide.slideNumber}/${totalSlides}`}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center">
          <h3
            className="text-lg font-bold leading-tight mb-3"
            style={{ color: brandColors.text }}
          >
            {slide.headline}
          </h3>
          {slide.body && (
            <p
              className="text-sm leading-relaxed opacity-80"
              style={{ color: brandColors.text }}
            >
              {slide.body}
            </p>
          )}
        </div>

        {/* Footer accent bar */}
        <div
          className="h-1 w-12 rounded-full"
          style={{ backgroundColor: brandColors.accent }}
        />
      </div>
    </div>
  );
}
