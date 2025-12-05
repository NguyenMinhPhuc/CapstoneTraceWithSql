"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import settingsService from "@/services/settings.service";
import { useTheme } from "@/contexts/theme-context";

export function AdminSettings() {
  const { toast } = useToast();
  const { applyTheme } = useTheme();
  const [settings, setSettings] = useState<Record<
    string,
    string | null
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [goalHours, setGoalHours] = useState<number>(700);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await settingsService.list();
        const map: Record<string, string | null> = {};
        list.forEach((s) => (map[s.key] = s.value));
        setSettings(map);
        if (map["earlyInternshipGoalHours"]) {
          setGoalHours(Number(map["earlyInternshipGoalHours"]) || 700);
        }
        // Apply theme settings to CSS variables
        applyThemeSettings(map);
      } catch (e) {
        toast({
          title: "Lỗi",
          description: "Không thể tải cài đặt hệ thống",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const applyThemeSettings = (map: Record<string, string | null>) => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    if (map["themePrimary"]) {
      root.style.setProperty("--primary", hexToHSL(map["themePrimary"]));
    }
    if (map["themePrimaryForeground"]) {
      root.style.setProperty(
        "--primary-foreground",
        hexToHSL(map["themePrimaryForeground"])
      );
    }
    if (map["themeBackground"]) {
      root.style.setProperty("--background", hexToHSL(map["themeBackground"]));
    }
    if (map["themeForeground"]) {
      root.style.setProperty("--foreground", hexToHSL(map["themeForeground"]));
    }
    if (map["themeAccent"]) {
      root.style.setProperty("--accent", hexToHSL(map["themeAccent"]));
    }
    if (map["themeAccentForeground"]) {
      root.style.setProperty(
        "--accent-foreground",
        hexToHSL(map["themeAccentForeground"])
      );
    }
  };

  const hexToHSL = (hex: string): string => {
    // Convert hex to RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const saveKey = async (key: string, value: string | null) => {
    try {
      await settingsService.upsert(key, value);
      toast({
        title: "Thành công",
        description: "Lưu thành công",
      });
      const list = await settingsService.list();
      const map: Record<string, string | null> = {};
      list.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
      // Apply theme globally after saving
      await applyTheme();
    } catch (e) {
      toast({
        title: "Lỗi",
        description: "Lưu thất bại",
        variant: "destructive",
      });
    }
  };

  const handleFeatureToggle = async (key: string, enabled: boolean) => {
    await saveKey(key, enabled ? "1" : "0");
  };

  const handleGoalHoursSave = async () => {
    await saveKey("earlyInternshipGoalHours", String(goalHours));
  };

  const onThemeSave = async (key: string, val: string) => {
    await saveKey(key, val);
  };

  if (loading || !settings) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt Giao diện</CardTitle>
          <CardDescription>
            Tùy chỉnh màu sắc chủ đạo của ứng dụng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: "themePrimary", label: "Màu chính" },
              { key: "themePrimaryForeground", label: "Màu chữ" },
              { key: "themeBackground", label: "Màu nền" },
              { key: "themeForeground", label: "Màu chữ nền" },
              { key: "themeAccent", label: "Màu nhấn" },
              { key: "themeAccentForeground", label: "Màu chữ nhấn" },
            ].map((item) => (
              <div key={item.key} className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">{item.label}</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings[item.key] || "#ffffff"}
                    onChange={(e) => onThemeSave(item.key, e.target.value)}
                    className="p-1 h-10 w-14"
                  />
                  <Input
                    type="text"
                    value={settings[item.key] || ""}
                    onChange={(e) => onThemeSave(item.key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt chung</CardTitle>
          <CardDescription>
            Bật hoặc tắt các tính năng của hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Cho phép sinh viên đăng ký</Label>
              <p className="text-sm text-muted-foreground">
                Nếu tắt, trang đăng ký sẽ bị khóa đối với người dùng mới.
              </p>
            </div>
            <Switch
              checked={(settings["allowStudentRegistration"] || "1") === "1"}
              onCheckedChange={(c) =>
                handleFeatureToggle("allowStudentRegistration", c)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Bật chế độ "Chấm điểm tổng"</Label>
              <p className="text-sm text-muted-foreground">
                Cho phép người chấm nhập điểm tổng.
              </p>
            </div>
            <Switch
              checked={(settings["enableOverallGrading"] || "0") === "1"}
              onCheckedChange={(c) =>
                handleFeatureToggle("enableOverallGrading", c)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">
                Cho phép sửa thuyết minh đã duyệt
              </Label>
              <p className="text-sm text-muted-foreground">
                Nếu bật, sinh viên có thể chỉnh sửa lại bản đã được duyệt.
              </p>
            </div>
            <Switch
              checked={
                (settings["allowEditingApprovedProposal"] || "0") === "1"
              }
              onCheckedChange={(c) =>
                handleFeatureToggle("allowEditingApprovedProposal", c)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Mở cổng nộp báo cáo</Label>
              <p className="text-sm text-muted-foreground">
                Nếu bật, sinh viên có thể nộp báo cáo bất cứ lúc nào.
              </p>
            </div>
            <Switch
              checked={(settings["forceOpenReportSubmission"] || "0") === "1"}
              onCheckedChange={(c) =>
                handleFeatureToggle("forceOpenReportSubmission", c)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">
                Mở cổng nộp báo cáo sau Hội đồng
              </Label>
              <p className="text-sm text-muted-foreground">
                Nếu bật, sinh viên sẽ có thể nộp phiên bản cuối cùng của báo cáo
                sau khi bảo vệ.
              </p>
            </div>
            <Switch
              checked={(settings["enablePostDefenseSubmission"] || "0") === "1"}
              onCheckedChange={(c) =>
                handleFeatureToggle("enablePostDefenseSubmission", c)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">
                Yêu cầu GVHD duyệt báo cáo cuối kỳ
              </Label>
              <p className="text-sm text-muted-foreground">
                Nếu bật, báo cáo cần được GVHD duyệt.
              </p>
            </div>
            <Switch
              checked={(settings["requireReportApproval"] || "1") === "1"}
              onCheckedChange={(c) =>
                handleFeatureToggle("requireReportApproval", c)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt Thực tập sớm</CardTitle>
          <CardDescription>
            Cấu hình các thông số cho chương trình thực tập sớm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="text-base">Số giờ mục tiêu</Label>
            <p className="text-sm text-muted-foreground">
              Tổng số giờ sinh viên cần hoàn thành trong chương trình thực tập
              sớm.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Input
                id="goal-hours-input"
                type="number"
                value={goalHours}
                onChange={(e) => setGoalHours(Number(e.target.value))}
                className="max-w-xs"
              />
              <Button onClick={handleGoalHoursSave}>Lưu</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
