"use client";

import { hierarchy, pack } from "d3-hierarchy";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface BubbleTraitDatum {
  label: string;
  value: number;
  category?: string;
}

interface BubbleTraitCloudProps {
  traits: BubbleTraitDatum[];
  className?: string;
  ariaLabel?: string;
}

interface PackedTraitDatum extends BubbleTraitDatum {
  layoutValue: number;
}

type RootDatum = {
  name: string;
  children: PackedTraitDatum[];
};

const MIN_LAYOUT_VALUE = 20;
const PACK_PADDING = 8;

const BUBBLE_STYLES = [
  { fill: "#99f6e4", stroke: "#5eead4", glow: "rgba(20, 184, 166, 0.22)" },
  { fill: "#bfdbfe", stroke: "#93c5fd", glow: "rgba(59, 130, 246, 0.2)" },
  { fill: "#fbcfe8", stroke: "#f9a8d4", glow: "rgba(217, 70, 239, 0.18)" },
  { fill: "#fde68a", stroke: "#fcd34d", glow: "rgba(245, 158, 11, 0.18)" },
  { fill: "#ddd6fe", stroke: "#c4b5fd", glow: "rgba(139, 92, 246, 0.18)" },
  { fill: "#bbf7d0", stroke: "#86efac", glow: "rgba(34, 197, 94, 0.18)" },
];

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function splitHebrewLabel(label: string, radius: number, fontSize: number) {
  if (radius < 18) return [];

  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const maxCharsPerLine = Math.max(3, Math.floor((radius * 1.55) / (fontSize * 0.55)));
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine || current.length === 0) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);

  const maxLines = radius > 58 ? 3 : radius > 38 ? 2 : 1;
  const visible = lines.slice(0, maxLines);
  if (lines.length > visible.length && visible.length > 0) {
    visible[visible.length - 1] = `${visible[visible.length - 1].replace(/\.+$/, "")}...`;
  }

  return visible;
}

function formatScore(value: number) {
  return `${Math.round(value)}/100`;
}

export function BubbleTraitCloud({
  traits,
  className,
  ariaLabel = "תרשים ענן מיומנויות המציג תכונות לפי גודל הציון",
}: BubbleTraitCloudProps) {
  const titleId = useId();
  const { ref, size } = useElementSize<HTMLDivElement>();

  const normalizedTraits = useMemo(
    () =>
      traits
        .filter((trait) => trait.label.trim().length > 0 && Number.isFinite(trait.value))
        .map((trait) => ({
          ...trait,
          value: Math.max(0, Math.min(100, trait.value)),
          layoutValue: Math.max(MIN_LAYOUT_VALUE, Math.max(0, trait.value)),
        }))
        .sort((a, b) => b.value - a.value),
    [traits]
  );

  const leaves = useMemo(() => {
    const { width, height } = size;
    if (width <= 0 || height <= 0 || normalizedTraits.length === 0) return [];

    const rootData: RootDatum = {
      name: "traits",
      children: normalizedTraits,
    };

    const root = hierarchy<RootDatum | PackedTraitDatum>(rootData)
      .sum((datum) => ("layoutValue" in datum ? datum.layoutValue : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    return pack<RootDatum | PackedTraitDatum>()
      .size([width, height])
      .padding(PACK_PADDING)(root)
      .leaves()
      .filter((leaf) => "label" in leaf.data);
  }, [normalizedTraits, size]);

  if (normalizedTraits.length === 0) {
    return (
      <div
        className={cn(
          "grid min-h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600",
          className
        )}
      >
        אין עדיין נתוני תכונות להצגה.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-[clamp(14rem,28vw,24rem)] overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50/60 p-2 shadow-inner",
        className
      )}
    >
      {size.width > 0 && size.height > 0 ? (
        <svg
          role="img"
          aria-labelledby={titleId}
          className="h-full w-full"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          <title id={titleId}>{ariaLabel}</title>
          <defs>
            <filter id={`${titleId}-soft-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f766e" floodOpacity="0.16" />
            </filter>
          </defs>
          {leaves.map((leaf, index) => {
            const data = leaf.data as PackedTraitDatum;
            const style = BUBBLE_STYLES[index % BUBBLE_STYLES.length];
            const fontSize = Math.max(10, Math.min(18, leaf.r / 3.4));
            const scoreFontSize = Math.max(9, Math.min(14, fontSize - 1));
            const lines = splitHebrewLabel(data.label, leaf.r, fontSize);
            const showScore = leaf.r >= 22;
            const lineHeight = fontSize * 1.16;
            const totalLines = lines.length + (showScore ? 1 : 0);
            const startY = -((totalLines - 1) * lineHeight) / 2;

            return (
              <g
                key={`${data.label}-${index}`}
                transform={`translate(${leaf.x}, ${leaf.y})`}
                tabIndex={0}
                role="img"
                aria-label={`${data.label}, ציון ${formatScore(data.value)}`}
                className="outline-none transition-opacity hover:opacity-95 focus-visible:opacity-95"
              >
                <title>{`${data.label}: ${formatScore(data.value)}`}</title>
                <circle
                  r={leaf.r}
                  fill={style.fill}
                  fillOpacity={0.78}
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth={2}
                  filter={`url(#${titleId}-soft-shadow)`}
                />
                <circle
                  r={Math.max(0, leaf.r - 2)}
                  fill="none"
                  stroke={style.stroke}
                  strokeOpacity={0.46}
                  strokeWidth={1}
                />
                <circle r={Math.max(0, leaf.r * 0.74)} fill={style.glow} opacity={0.55} />
                {lines.length > 0 ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none fill-slate-800 font-bold"
                    style={{ fontSize }}
                  >
                    {lines.map((line, lineIndex) => (
                      <tspan
                        key={line}
                        x={0}
                        y={startY + lineIndex * lineHeight}
                        direction="rtl"
                        unicodeBidi="bidi-override"
                      >
                        {line}
                      </tspan>
                    ))}
                    {showScore ? (
                      <tspan
                        x={0}
                        y={startY + lines.length * lineHeight}
                        direction="ltr"
                        unicodeBidi="bidi-override"
                        className="fill-slate-600 font-semibold"
                        style={{ fontSize: scoreFontSize }}
                      >
                        {formatScore(data.value)}
                      </tspan>
                    ) : null}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      ) : null}
    </div>
  );
}
