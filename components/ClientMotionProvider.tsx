"use client";

import { MotionConfig } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Component that uses useSearchParams
function AnimationConfig({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const noAnim = params.get("noanim") === "1";

  return (
    <MotionConfig reducedMotion={noAnim ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}

export default function ClientMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<MotionConfig reducedMotion="never">{children}</MotionConfig>}>
      <AnimationConfig>{children}</AnimationConfig>
    </Suspense>
  );
}
