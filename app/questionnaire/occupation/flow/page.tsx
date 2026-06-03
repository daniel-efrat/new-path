"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step12FlowPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/questionnaire?step=12");
  }, [router]);

  return <p className="p-6 text-center">מעביר לשלב הבא...</p>;
}
