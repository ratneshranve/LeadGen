"use client";

import * as React from "react";
import { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Function (from @/lib/utils) ---

/**
 * A utility function to conditionally join class names.
 * Requires `clsx` and `tailwind-merge` to be installed.
 * `npm install clsx tailwind-merge`
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Card Components ---

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AnimatedCard({ className, ...props }: CardProps) {
  return (
    <div
      role="region"
      aria-labelledby="card-title"
      aria-describedby="card-description"
      className={cn(
        "group/animated-card relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e1d24] shadow-xl text-white",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps) {
  return (
    <div
      role="group"
      className={cn(
        "flex flex-col space-y-1.5 border-t border-white/10 p-5",
        className
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-bold leading-none tracking-tight text-white",
        className
      )}
      {...props}
    />
  );
}

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-neutral-400",
        className
      )}
      {...props}
    />
  );
}

export function CardVisual({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("h-[200px] w-full overflow-hidden relative flex items-center justify-center", className)}
      {...props}
    />
  );
}

// --- Visual3 Component and its Sub-components ---

interface Visual3Props {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
  badge1Text?: string;
  badge2Text?: string;
  infoTitle?: string;
  infoSub?: string;
  rectsCustomData?: Array<{
    width: number;
    height: number;
    y: number;
    hoverHeight: number;
    hoverY: number;
    x: number;
    fill: string;
    hoverFill?: string;
    label?: string;
    count?: number;
    percentage?: number;
  }>;
  onHoverRect?: (rect: any | null) => void;
}

export function Visual3({
  mainColor = "#ff3b19",
  secondaryColor = "#ea580c",
  gridColor = "#ffffff10",
  badge1Text = "+15,2%",
  badge2Text = "+18,7%",
  infoTitle = "Pipeline Velocity",
  infoSub = "Displaying conversion & stage stats.",
  rectsCustomData,
  onHoverRect,
}: Visual3Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          if (onHoverRect) onHoverRect(null);
        }}
        style={
          {
            "--color": mainColor,
            "--secondary-color": secondaryColor,
          } as React.CSSProperties
        }
      />

      <div className="relative h-[200px] w-full max-w-[440px] overflow-hidden rounded-t-lg flex items-center justify-center">
        <Layer4
          color={mainColor}
          secondaryColor={secondaryColor}
          hovered={hovered}
          customRects={rectsCustomData}
          onHoverRect={onHoverRect}
        />
        <Layer3 color={mainColor} />
        <Layer2 color={mainColor} title={infoTitle} subtitle={infoSub} />
        <Layer1 color={mainColor} secondaryColor={secondaryColor} badge1={badge1Text} badge2={badge2Text} />
        <EllipseGradient color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </>
  );
}

interface LayerProps {
  color: string;
  secondaryColor?: string;
  hovered?: boolean;
}

const GridLayer: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div
      style={{ "--grid-color": color } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full bg-transparent bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:20px_20px] bg-center opacity-70 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
    />
  );
};

const EllipseGradient: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 z-[5] flex h-full w-full items-center justify-center pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 356 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect width="356" height="180" fill="url(#paint0_radial_12_207)" />
        <defs>
          <radialGradient
            id="paint0_radial_12_207"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(178 98) rotate(90) scale(98 178)"
          >
            <stop stopColor={color} stopOpacity="0.32" />
            <stop offset="0.45" stopColor={color} stopOpacity="0.14" />
            <stop offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

const Layer1: React.FC<{ color: string; secondaryColor?: string; badge1?: string; badge2?: string }> = ({
  color,
  secondaryColor,
  badge1 = "+15,2%",
  badge2 = "+18,7%",
}) => {
  return (
    <div
      className="absolute top-4 left-4 z-[8] flex items-center gap-1.5 pointer-events-none"
      style={
        {
          "--color": color,
          "--secondary-color": secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="flex shrink-0 items-center rounded-full border border-neutral-700/80 bg-black/40 px-2 py-0.5 backdrop-blur-md transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--color)] shadow-[0_0_6px_var(--color)]" />
        <span className="ml-1.5 text-[11px] font-semibold text-white">
          {badge1}
        </span>
      </div>
      <div className="flex shrink-0 items-center rounded-full border border-neutral-700/80 bg-black/40 px-2 py-0.5 backdrop-blur-md transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--secondary-color)] shadow-[0_0_6px_var(--secondary-color)]" />
        <span className="ml-1.5 text-[11px] font-semibold text-white">
          {badge2}
        </span>
      </div>
    </div>
  );
};

const Layer2: React.FC<{ color: string; title?: string; subtitle?: string }> = ({
  color,
  title = "Pipeline Velocity",
  subtitle = "Displaying stage & conversion stats.",
}) => {
  return (
    <div
      className="group relative h-full w-full pointer-events-none"
      style={{ "--color": color } as React.CSSProperties}
    >
      <div className="[transition-timing-function:cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[7] flex w-full translate-y-full items-start justify-center bg-transparent p-3 transition-transform duration-500 group-hover/animated-card:translate-y-0">
        <div className="[transition-timing-function:cubic-bezier(0.6,0,1)] rounded-lg border border-neutral-700/80 bg-black/70 px-3 py-2 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover/animated-card:opacity-100 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--color)] shadow-[0_0_8px_var(--color)]" />
            <p className="text-xs font-bold text-white tracking-wide">
              {title}
            </p>
          </div>
          <p className="text-[11px] text-neutral-300 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

const Layer3: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="[transition-timing-function:cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[6] flex translate-y-full items-center justify-center opacity-0 transition-all duration-500 group-hover/animated-card:translate-y-0 group-hover/animated-card:opacity-100 pointer-events-none">
      <svg
        width="100%"
        height="180"
        viewBox="0 0 356 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="356" height="180" fill="url(#paint0_linear_29_3)" />
        <defs>
          <linearGradient
            id="paint0_linear_29_3"
            x1="178"
            y1="0"
            x2="178"
            y2="180"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.35" stopColor={color} stopOpacity="0" />
            <stop offset="1" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

interface CustomRectItem {
  width: number;
  height: number;
  y: number;
  hoverHeight: number;
  hoverY: number;
  x: number;
  fill: string;
  hoverFill?: string;
  label?: string;
  count?: number;
  percentage?: number;
}

const Layer4: React.FC<{
  color: string;
  secondaryColor?: string;
  hovered?: boolean;
  customRects?: CustomRectItem[];
  onHoverRect?: (rect: any | null) => void;
}> = ({ color, secondaryColor, hovered, customRects, onHoverRect }) => {
  const defaultRectsData = [
    {
      width: 15,
      height: 20,
      y: 110,
      hoverHeight: 20,
      hoverY: 130,
      x: 40,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 20,
      y: 90,
      hoverHeight: 20,
      hoverY: 130,
      x: 60,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 40,
      y: 70,
      hoverHeight: 30,
      hoverY: 120,
      x: 80,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 80,
      hoverHeight: 50,
      hoverY: 100,
      x: 100,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 110,
      hoverHeight: 40,
      hoverY: 110,
      x: 120,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 50,
      y: 110,
      hoverHeight: 20,
      hoverY: 130,
      x: 140,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 50,
      y: 60,
      hoverHeight: 30,
      hoverY: 120,
      x: 160,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 80,
      hoverHeight: 20,
      hoverY: 130,
      x: 180,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 20,
      y: 110,
      hoverHeight: 40,
      hoverY: 110,
      x: 200,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 40,
      y: 70,
      hoverHeight: 60,
      hoverY: 90,
      x: 220,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 110,
      hoverHeight: 70,
      hoverY: 80,
      x: 240,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 50,
      y: 110,
      hoverHeight: 50,
      hoverY: 100,
      x: 260,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 20,
      y: 110,
      hoverHeight: 80,
      hoverY: 70,
      x: 280,
      fill: "rgba(255,255,255,0.12)",
      hoverFill: secondaryColor || "#ea580c",
    },
    {
      width: 15,
      height: 30,
      y: 80,
      hoverHeight: 90,
      hoverY: 60,
      x: 300,
      fill: color,
      hoverFill: color,
    },
  ];

  const rectsData = customRects && customRects.length > 0 ? customRects : defaultRectsData;

  return (
    <div className="[transition-timing-function:cubic-bezier(0.6,0.6,0,1)] absolute inset-0 z-[8] flex h-[180px] w-full items-center justify-center transition-transform duration-500 group-hover/animated-card:scale-[1.12]">
      <svg width="356" height="180" viewBox="0 0 356 180" xmlns="http://www.w3.org/2000/svg">
        {rectsData.map((rect, index) => (
          <rect
            key={index}
            width={rect.width}
            height={hovered ? rect.hoverHeight : rect.height}
            x={rect.x}
            y={hovered ? rect.hoverY : rect.y}
            fill={hovered ? (rect.hoverFill || rect.fill) : rect.fill}
            rx="2.5"
            ry="2.5"
            className="[transition-timing-function:cubic-bezier(0.6,0.6,0,1)] transition-all duration-500 cursor-pointer"
            onMouseEnter={() => {
              if (onHoverRect) onHoverRect(rect);
            }}
          />
        ))}
      </svg>
    </div>
  );
};
