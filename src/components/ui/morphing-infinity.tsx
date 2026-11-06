"use client";

import { cn } from "@/lib/utils";

const infinity =
  "M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z";

function MorphingInfinity({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="status"
      aria-label="Loading"
      className={cn("morphing-infinity", className)}
      {...props}
    >
      <path className="morphing-infinity__path" d={infinity} pathLength={100} />
    </svg>
  );
}

export { MorphingInfinity };
export default MorphingInfinity;
