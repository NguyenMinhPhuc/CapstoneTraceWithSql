import React from "react";
import { defenseService } from "@/services/defense.service";
import StudentsList from "@/components/session-management/StudentsList";

interface Props {
  params: { id: string };
}

export default async function ManagePage({ params }: Props) {
  const id = Number(params.id);
  let session: any = null;
  try {
    session = await defenseService.getById(id);
  } catch (e) {
    // ignore
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Quản lý đợt: {session?.name || `#${id}`}
        </h2>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <StudentsList sessionId={String(id)} />
      </div>
    </div>
  );
}
