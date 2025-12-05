"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/services/profile.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/change-password-form";
import StudentProfileView from "@/components/student-profile-view";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await profileService.get();
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || "");
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Không thể tải hồ sơ");
      } finally {
        setLoadingProfile(false);
      }
    };
    if (user) load();
  }, [user]);

  const onSave = async () => {
    if (!fullName) {
      toast.error("Họ và tên là bắt buộc");
      return;
    }
    try {
      setSaving(true);
      await profileService.update({
        fullName,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      toast.success("Đã cập nhật hồ sơ");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file?: File) => {
    if (!file) return;
    try {
      setSaving(true);
      const url = await profileService.uploadAvatar(file);
      setAvatarUrl(url);
      toast.success("Đã tải lên avatar");
    } catch (e: any) {
      toast.error(e?.message || "Không thể tải lên avatar");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="p-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ cá nhân</CardTitle>
          <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || "/avatar-placeholder.png"}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover border"
            />
            <div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="pt-2">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ sinh viên</CardTitle>
          <CardDescription>Cập nhật thông tin sinh viên</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <StudentProfileView
              studentId={String(user.id)}
              onClose={() => {}}
              editable={true}
              onSaved={async () => {
                // refresh profile section if needed
                try {
                  const data = await profileService.get();
                  setProfile(data);
                } catch (e) {
                  /* ignore */
                }
              }}
            />
          ) : (
            <div>Vui lòng đăng nhập để quản lý hồ sơ sinh viên.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>
            Vui lòng không chia sẻ mật khẩu với bất kỳ ai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
