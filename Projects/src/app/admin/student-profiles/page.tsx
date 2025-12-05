"use client";

import { useEffect, useState } from "react";
import { studentsService, type Student } from "@/services/students.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentProfileView from "@/components/student-profile-view";
import StudentProfilesTable from "@/components/student-profiles-table";

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await studentsService.getAll();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Quản lý hồ sơ sinh viên</h1>
        <div>
          <Button onClick={load}>Làm mới</Button>
        </div>
      </div>

      <div>
        <StudentProfilesTable
          students={students}
          onOpenProfile={(id) => {
            const s = students.find((st) => String(st.id) === String(id));
            if (s) setSelectedStudent(s);
            setShowDialog(true);
          }}
        />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hồ sơ sinh viên</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <StudentProfileView
              studentId={String(selectedStudent.id)}
              onClose={() => setShowDialog(false)}
              editable={true}
              onSaved={() => {
                load();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
