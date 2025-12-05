"use client";

import { useState } from "react";
import studentProfilesService, {
  StudentProfile,
} from "@/services/studentProfiles.service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function StudentProfileForm({
  initialProfile,
  studentId,
  onFinished,
}: {
  initialProfile?: StudentProfile | null;
  studentId: string;
  onFinished?: () => void;
}) {
  const [contactAddress, setContactAddress] = useState(
    initialProfile?.contact_info
      ? JSON.parse(initialProfile.contact_info).address
      : ""
  );
  const [contactPhone, setContactPhone] = useState(
    initialProfile?.contact_info
      ? JSON.parse(initialProfile.contact_info).phone
      : ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialProfile?.contact_info
      ? JSON.parse(initialProfile.contact_info).email
      : ""
  );

  const [guardians, setGuardians] = useState(() => {
    if (!initialProfile?.guardian_info)
      return [{ name: "", relation: "", phone: "", address: "" }];
    try {
      const parsed = JSON.parse(initialProfile.guardian_info);
      if (Array.isArray(parsed))
        return parsed.map((g) => ({
          name: g.name || "",
          relation: g.relation || "",
          phone: g.phone || "",
          address: g.address || "",
        }));
      // single object -> wrap into array
      return [
        {
          name: parsed.name || "",
          relation: parsed.relation || "",
          phone: parsed.phone || "",
          address: parsed.address || "",
        },
      ];
    } catch {
      return [{ name: "", relation: "", phone: "", address: "" }];
    }
  });

  const [residenceAddress, setResidenceAddress] = useState(
    initialProfile?.residence_address || ""
  );
  const [residencyType, setResidencyType] = useState<string>(
    (initialProfile as any)?.residency_type || "family"
  );
  const [residencyDetails, setResidencyDetails] = useState(() => {
    try {
      const raw = (initialProfile as any)?.residency_details;
      if (!raw) return {};
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  });
  const [familyCircumstances, setFamilyCircumstances] = useState(
    initialProfile?.family_circumstances || ""
  );
  const [awards, setAwards] = useState(initialProfile?.awards || "");
  const [disciplinary, setDisciplinary] = useState(
    initialProfile?.disciplinary || ""
  );
  const [activities, setActivities] = useState(
    initialProfile?.activities || ""
  );
  const [healthStatus, setHealthStatus] = useState(
    initialProfile?.health_status || ""
  );

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        student_id: Number(studentId),
        contact_info: JSON.stringify({
          address: contactAddress,
          phone: contactPhone,
          email: contactEmail,
        }),
        // send guardians as JSON array for multi-guardian support
        guardian_info: JSON.stringify(guardians),
        residency_type: residencyType,
        residency_details: JSON.stringify(residencyDetails || {}),
        residence_address: residenceAddress,
        family_circumstances: familyCircumstances,
        awards,
        disciplinary,
        activities,
        health_status: healthStatus,
      };

      if (initialProfile) {
        // Use studentId (student_id) as the identifier for update since profile rows are keyed by student_id
        await studentProfilesService.update(Number(studentId), payload);
      } else {
        await studentProfilesService.create(payload);
      }

      toast({ title: "Thành công", description: "Đã lưu hồ sơ" });
      onFinished && onFinished();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể lưu hồ sơ",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Địa chỉ liên hệ</label>
          <Input
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Điện thoại liên hệ</label>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email liên hệ</label>
          <Input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Người thân</label>
          <div className="space-y-2 mt-2">
            {guardians.map((g, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 items-end">
                <div className="col-span-2">
                  <Input
                    placeholder="Tên"
                    value={g.name}
                    onChange={(e) =>
                      setGuardians((prev) =>
                        prev.map((it, idx) =>
                          idx === i ? { ...it, name: e.target.value } : it
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    placeholder="Mối quan hệ"
                    value={g.relation}
                    onChange={(e) =>
                      setGuardians((prev) =>
                        prev.map((it, idx) =>
                          idx === i ? { ...it, relation: e.target.value } : it
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Điện thoại"
                    value={g.phone}
                    onChange={(e) =>
                      setGuardians((prev) =>
                        prev.map((it, idx) =>
                          idx === i ? { ...it, phone: e.target.value } : it
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-1 flex gap-2">
                  <Input
                    placeholder="Địa chỉ"
                    value={g.address}
                    onChange={(e) =>
                      setGuardians((prev) =>
                        prev.map((it, idx) =>
                          idx === i ? { ...it, address: e.target.value } : it
                        )
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setGuardians((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
            <div>
              <Button
                variant="outline"
                onClick={() =>
                  setGuardians((prev) => [
                    ...prev,
                    { name: "", relation: "", phone: "", address: "" },
                  ])
                }
              >
                Thêm người thân
              </Button>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Loại chỗ ở</label>
          <div className="flex gap-4 items-center mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="resType"
                checked={residencyType === "dorm"}
                onChange={() => setResidencyType("dorm")}
              />
              <span>Nội trú (ký túc xá)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="resType"
                checked={residencyType === "rented"}
                onChange={() => setResidencyType("rented")}
              />
              <span>Ở trọ</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="resType"
                checked={residencyType === "family"}
                onChange={() => setResidencyType("family")}
              />
              <span>Ở với gia đình</span>
            </label>
          </div>

          <div className="mt-3 space-y-2">
            {residencyType === "dorm" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Ký túc xá</label>
                  <Input
                    value={(residencyDetails as any).dorm_name || ""}
                    onChange={(e) =>
                      setResidencyDetails((prev: any) => ({
                        ...prev,
                        dorm_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Phòng/Số</label>
                  <Input
                    value={(residencyDetails as any).dorm_room || ""}
                    onChange={(e) =>
                      setResidencyDetails((prev: any) => ({
                        ...prev,
                        dorm_room: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
            {residencyType === "rented" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Địa chỉ trọ</label>
                  <Input
                    value={(residencyDetails as any).rented_address || ""}
                    onChange={(e) =>
                      setResidencyDetails((prev: any) => ({
                        ...prev,
                        rented_address: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Tên chủ trọ</label>
                  <Input
                    value={(residencyDetails as any).landlord_name || ""}
                    onChange={(e) =>
                      setResidencyDetails((prev: any) => ({
                        ...prev,
                        landlord_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Điện thoại chủ trọ</label>
                  <Input
                    value={(residencyDetails as any).landlord_phone || ""}
                    onChange={(e) =>
                      setResidencyDetails((prev: any) => ({
                        ...prev,
                        landlord_phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
            {residencyType === "family" && (
              <div>
                <label className="text-sm font-medium">
                  Địa chỉ thường trú (sẽ dùng làm địa chỉ)
                </label>
                <Input
                  value={residenceAddress}
                  onChange={(e) => setResidenceAddress(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Hoàn cảnh gia đình</label>
          <Textarea
            value={familyCircumstances}
            onChange={(e) => setFamilyCircumstances(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Hoạt động</label>
          <Textarea
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
          />
        </div>

        <div className="col-span-1">
          <label className="text-sm font-medium">Khen thưởng</label>
          <Textarea
            value={awards}
            onChange={(e) => setAwards(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium">Kỷ luật</label>
          <Textarea
            value={disciplinary}
            onChange={(e) => setDisciplinary(e.target.value)}
          />
        </div>

        <div className="col-span-1">
          <label className="text-sm font-medium">Tình trạng sức khỏe</label>
          <Input
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => onFinished && onFinished()}
          disabled={saving}
        >
          Hủy
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </div>
  );
}

export default StudentProfileForm;
