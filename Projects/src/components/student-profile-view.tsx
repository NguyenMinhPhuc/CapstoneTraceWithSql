"use client";

import { useEffect, useState } from "react";
import studentProfilesService, {
  StudentProfile,
} from "@/services/studentProfiles.service";
import StudentProfileForm from "./student-profile-form";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

export function StudentProfileView({
  studentId,
  onClose,
  editable = false,
  onSaved,
}: {
  studentId: string;
  onClose: () => void;
  editable?: boolean;
  onSaved?: () => void;
}) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, [studentId]);

  const load = async () => {
    setLoading(true);
    try {
      const p = await studentProfilesService.getByStudentId(studentId);
      setProfile(p);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể tải hồ sơ",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  const contact = profile?.contact_info
    ? JSON.parse(profile.contact_info)
    : null;
  const guardianRaw = profile?.guardian_info
    ? (() => {
        try {
          return JSON.parse(profile!.guardian_info);
        } catch {
          return null;
        }
      })()
    : null;
  const guardians = !guardianRaw
    ? []
    : Array.isArray(guardianRaw)
    ? guardianRaw
    : [guardianRaw];
  const residencyType = (profile as any)?.residency_type || null;
  const residencyDetailsRaw = (profile as any)?.residency_details
    ? (() => {
        try {
          return JSON.parse((profile as any).residency_details);
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Hồ sơ sinh viên</h3>
        <div className="flex gap-2">
          {editable && !editing && (
            <Button onClick={() => setEditing(true)}>Chỉnh sửa</Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>

      {!profile ? (
        <div className="text-muted-foreground">Chưa có hồ sơ</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Thông tin liên hệ</h4>
            <div>Địa chỉ: {contact?.address || "-"}</div>
            <div>Điện thoại: {contact?.phone || "-"}</div>
            <div>Email: {contact?.email || "-"}</div>
          </div>

          <div>
            <h4 className="font-medium">Người thân</h4>
            {guardians.length === 0 ? (
              <div className="text-muted-foreground">Chưa có người thân</div>
            ) : (
              <div className="space-y-2">
                {guardians.map((g, idx) => (
                  <div key={idx} className="p-2 border rounded">
                    <div>
                      <strong>Tên:</strong> {g.name || "-"}
                    </div>
                    <div>
                      <strong>Mối quan hệ:</strong> {g.relation || "-"}
                    </div>
                    <div>
                      <strong>Điện thoại:</strong> {g.phone || "-"}
                    </div>
                    <div>
                      <strong>Địa chỉ:</strong> {g.address || "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium">Thường trú</h4>
            <div>{profile.residence_address || "-"}</div>
          </div>

          <div>
            <h4 className="font-medium">Chỗ ở hiện tại</h4>
            <div>
              <strong>Loại:</strong> {residencyType || "-"}
            </div>
            {residencyDetailsRaw ? (
              <div className="mt-2 space-y-1">
                {residencyType === "dorm" && (
                  <>
                    <div>
                      <strong>Ký túc xá:</strong>{" "}
                      {residencyDetailsRaw.dorm_name || "-"}
                    </div>
                    <div>
                      <strong>Phòng:</strong>{" "}
                      {residencyDetailsRaw.dorm_room || "-"}
                    </div>
                  </>
                )}
                {residencyType === "rented" && (
                  <>
                    <div>
                      <strong>Địa chỉ trọ:</strong>{" "}
                      {residencyDetailsRaw.rented_address || "-"}
                    </div>
                    <div>
                      <strong>Chủ trọ:</strong>{" "}
                      {residencyDetailsRaw.landlord_name || "-"}
                    </div>
                    <div>
                      <strong>Điện thoại chủ trọ:</strong>{" "}
                      {residencyDetailsRaw.landlord_phone || "-"}
                    </div>
                  </>
                )}
                {residencyType === "family" && (
                  <div>
                    <strong>Địa chỉ gia đình:</strong>{" "}
                    {profile.residence_address || "-"}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">
                Chưa có thông tin chỗ ở
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium">Tình trạng sức khỏe</h4>
            <div>{profile.health_status || "-"}</div>
          </div>

          <div className="col-span-2">
            <h4 className="font-medium">Hoàn cảnh gia đình</h4>
            <div>{profile.family_circumstances || "-"}</div>
          </div>

          <div className="col-span-2">
            <h4 className="font-medium">Hoạt động / Khen thưởng / Kỷ luật</h4>
            <div>Hoạt động: {profile.activities || "-"}</div>
            <div>Khen thưởng: {profile.awards || "-"}</div>
            <div>Kỷ luật: {profile.disciplinary || "-"}</div>
          </div>
        </div>
      )}

      {editing && (
        <StudentProfileForm
          initialProfile={profile}
          studentId={studentId}
          onFinished={async () => {
            setEditing(false);
            await load();
            onSaved && onSaved();
          }}
        />
      )}
    </div>
  );
}

export default StudentProfileView;
