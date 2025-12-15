"use client";

import React, { useEffect, useState } from "react";
import { defenseService, DefenseSession } from "@/services/defense.service";
import { Skeleton } from "@/components/ui/skeleton";
import PositionsList from "@/components/internship-positions/PositionsList";

export default function InternshipPositionsPage() {
  const [sessions, setSessions] = useState<DefenseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await defenseService.getAll();
        if (!mounted) return;
        setSessions(list || []);
        if (list && list.length > 0) setSelected(list[0].id);
      } catch (e) {
        setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Quản lý Vị trí thực tập theo đợt</h1>

      <div>
        {loading && <Skeleton className="h-10 w-64 rounded" />}
        {!loading && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Chọn đợt:</label>
            <select
              className="border rounded p-2"
              value={selected ?? ""}
              onChange={(e) => setSelected(Number(e.target.value) || null)}
            >
              <option value="">-- Chọn đợt --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selected ? (
        <PositionsList sessionId={selected} />
      ) : (
        <p>Vui lòng chọn một đợt để xem danh sách vị trí.</p>
      )}
    </div>
  );
}
