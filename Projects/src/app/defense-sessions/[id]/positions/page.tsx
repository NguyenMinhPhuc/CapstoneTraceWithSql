"use client";

import React from "react";
import PositionsList from "../../../../components/internship-positions/PositionsList";
import { useSearchParams } from "next/navigation";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  const sessionId = Number(params.id);
  const search = useSearchParams();
  const companyId = search?.get("companyId")
    ? Number(search.get("companyId"))
    : undefined;
  return (
    <div className="p-6">
      <PositionsList sessionId={sessionId} initialCompanyId={companyId} />
    </div>
  );
}
