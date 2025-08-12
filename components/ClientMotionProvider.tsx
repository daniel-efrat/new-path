"use client";

import { MotionConfig } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function ClientMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // הפעלה דרך פרמטר כתובת: ?noanim=1
  const params = useSearchParams();
  const noAnim = params.get("noanim") === "1";

  return (
    <MotionConfig reducedMotion={noAnim ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
