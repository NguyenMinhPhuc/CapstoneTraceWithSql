"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-center">
              Đăng ký không khả dụng
            </CardTitle>
            <CardDescription className="text-center">
              Chức năng đăng ký công khai đã được tắt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Hệ thống không cho phép đăng ký trực tiếp. Tài khoản của bạn sẽ
                được tạo bởi:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Admin</strong> - Tạo tài khoản quản trị viên và quản
                  lý
                </li>
                <li>
                  <strong>Quản lý sinh viên</strong> - Tạo tài khoản sinh viên
                </li>
                <li>
                  <strong>Quản lý giáo viên</strong> - Tạo tài khoản giảng viên
                </li>
              </ul>
              <p className="mt-4">
                Nếu bạn đã có tài khoản, vui lòng đăng nhập.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/login")} className="w-full">
                Đăng nhập
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
