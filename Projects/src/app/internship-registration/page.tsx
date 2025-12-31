"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InternshipRegistrationRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/register-internship");
  }, [router]);
  return null;
}
