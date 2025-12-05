"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  userManagementService,
  User,
} from "@/services/user-management.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  UserPlus,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ROLE_LABELS: Record<string, string> = {
  admin: "Quản trị hệ thống",
  manager: "Quản lý",
  supervisor: "GVHD",
  student: "Sinh viên",
  council_member: "Hội đồng",
};

export default function UserManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  // Add user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");
  const [newUserPhone, setNewUserPhone] = useState("");
  // Edit user dialog state
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [editUserFullName, setEditUserFullName] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserAvatarUrl, setEditUserAvatarUrl] = useState("");
  const [editUserIsActive, setEditUserIsActive] = useState<boolean>(true);
  const [editLoading, setEditLoading] = useState(false);
  // Statistics state
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Check authentication and authorization
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.role !== "admin" && user.role !== "manager") {
      toast.error("Bạn không có quyền truy cập trang này");
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort users locally
  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any = a[sortField as keyof User];
    let bValue: any = b[sortField as keyof User];

    // Handle null/undefined
    if (!aValue) return sortOrder === "asc" ? 1 : -1;
    if (!bValue) return sortOrder === "asc" ? -1 : 1;

    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Load users for statistics (all records)
  const loadAllUsersForStats = async () => {
    try {
      const response = await userManagementService.listUsers(1, 10000); // Load up to 10000 records
      setAllUsers(response.users);
    } catch (error: any) {
      console.error("Error loading all users for stats:", error);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const isActive =
        isActiveFilter === "all" ? undefined : isActiveFilter === "true";
      const response = await userManagementService.listUsers(
        page,
        pageSize,
        search || undefined,
        roleFilter === "all" ? undefined : roleFilter,
        isActive
      );
      setUsers(response.users);
      setTotal(response.total);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "manager")) {
      loadAllUsersForStats();
      loadUsers();
    }
  }, [page, search, roleFilter, isActiveFilter, user]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?")) {
      return;
    }

    try {
      await userManagementService.deleteUser(userId);
      toast.success("Đã vô hiệu hóa tài khoản");
      loadAllUsersForStats();
      loadUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể vô hiệu hóa tài khoản"
      );
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.is_active) {
      // Vô hiệu hóa tài khoản
      if (!confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản "${user.email}"?`)) {
        return;
      }
      try {
        await userManagementService.deleteUser(user.id);
        toast.success("Đã vô hiệu hóa tài khoản");
        loadAllUsersForStats();
        loadUsers();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể vô hiệu hóa tài khoản"
        );
      }
    } else {
      // Kích hoạt lại tài khoản
      try {
        await userManagementService.activateUser(user.id);
        toast.success("Đã kích hoạt tài khoản");
        loadAllUsersForStats();
        loadUsers();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể kích hoạt tài khoản"
        );
      }
    }
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setResetLoading(true);
      await userManagementService.resetPassword(selectedUser.id, newPassword);
      toast.success("Đã reset mật khẩu thành công");
      setResetPasswordDialog(false);
      setSelectedUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể reset mật khẩu");
    } finally {
      setResetLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserFullName || !newUserRole) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setAddUserLoading(true);
      await userManagementService.createUser({
        email: newUserEmail,
        password: newUserPassword,
        fullName: newUserFullName,
        role: newUserRole,
        phone: newUserPhone || undefined,
      });
      toast.success("Đã tạo tài khoản thành công");
      setAddUserDialog(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserRole("student");
      setNewUserPhone("");
      loadAllUsersForStats();
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo tài khoản");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    if (!editUserFullName) {
      toast.error("Họ và tên là bắt buộc");
      return;
    }
    try {
      setEditLoading(true);
      await userManagementService.updateUser(selectedUser.id, {
        fullName: editUserFullName,
        phone: editUserPhone || undefined,
        avatarUrl: editUserAvatarUrl || undefined,
        isActive: editUserIsActive,
      });
      toast.success("Đã cập nhật thông tin tài khoản");
      setEditUserDialog(false);
      setSelectedUser(null);
      loadAllUsersForStats();
      loadUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật tài khoản"
      );
    } finally {
      setEditLoading(false);
    }
  };

  if (
    authLoading ||
    !user ||
    (user.role !== "admin" && user.role !== "manager")
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  // Calculate role statistics from ALL users, not just current page
  const roleStats = allUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    admin: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    manager: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    supervisor: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    student: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    council_member: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản Lý Tài Khoản</h1>
        {user.role === "admin" && (
          <Button onClick={() => setAddUserDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm Người Dùng
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(roleStats).map(([role, count]) => {
          const colors = roleColors[role] || {
            bg: "bg-gray-50",
            text: "text-gray-700",
            border: "border-gray-200",
          };
          return (
            <div
              key={role}
              className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  {ROLE_LABELS[role] || role}
                </span>
                <span className={`text-3xl font-bold ${colors.text}`}>
                  {count}
                </span>
              </div>
            </div>
          );
        })}
        <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4 transition-all hover:shadow-md">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Tổng cộng
            </span>
            <span className="text-3xl font-bold text-gray-900">
              {allUsers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo email hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={() => {
                setSearch("");
                loadUsers();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              ×
            </button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Quản trị hệ thống</SelectItem>
            <SelectItem value="manager">Quản lý</SelectItem>
            <SelectItem value="supervisor">GVHD</SelectItem>
            <SelectItem value="student">Sinh viên</SelectItem>
            <SelectItem value="council_member">Hội đồng</SelectItem>
          </SelectContent>
        </Select>
        <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Đã vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadUsers}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">STT</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("email")}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Email
                      {sortField === "email" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        ))}
                      {sortField !== "email" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("full_name")}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Họ và Tên
                      {sortField === "full_name" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        ))}
                      {sortField !== "full_name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("role")}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Vai Trò
                      {sortField === "role" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        ))}
                      {sortField !== "role" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Mã SV/GVHD</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("is_active")}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Trạng Thái
                      {sortField === "is_active" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        ))}
                      {sortField !== "is_active" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("last_login")}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Đăng Nhập Gần Nhất
                      {sortField === "last_login" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        ))}
                      {sortField !== "last_login" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.student_code || user.department || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() => handleToggleStatus(user)}
                          />
                          {user.is_active ? (
                            <Badge variant="default">Hoạt động</Badge>
                          ) : (
                            <Badge variant="destructive">Vô hiệu hóa</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString("vi-VN")
                          : "Chưa đăng nhập"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserFullName(user.full_name || "");
                              setEditUserPhone(user.phone || "");
                              setEditUserAvatarUrl(
                                (user as any).avatar_url || ""
                              );
                              setEditUserIsActive(!!user.is_active);
                              setEditUserDialog(true);
                            }}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetPasswordDialog(user)}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Reset MK
                          </Button>
                          {user.is_active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Vô hiệu hóa
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {users.length} / {total} người dùng
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới cho người dùng. Tài khoản sẽ được tạo với trạng
              thái vô hiệu hóa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò *</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị hệ thống</SelectItem>
                  <SelectItem value="manager">Quản lý</SelectItem>
                  <SelectItem value="supervisor">GVHD</SelectItem>
                  <SelectItem value="student">Sinh viên</SelectItem>
                  <SelectItem value="council_member">Hội đồng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                placeholder="0123456789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddUserDialog(false)}
              disabled={addUserLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleAddUser} disabled={addUserLoading}>
              {addUserLoading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thông tin tài khoản</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ bản của người dùng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={selectedUser?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFullName">Họ và tên *</Label>
              <Input
                id="editFullName"
                value={editUserFullName}
                onChange={(e) => setEditUserFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Số điện thoại</Label>
              <Input
                id="editPhone"
                value={editUserPhone}
                onChange={(e) => setEditUserPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAvatar">Avatar URL</Label>
              <Input
                id="editAvatar"
                value={editUserAvatarUrl}
                onChange={(e) => setEditUserAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
              <div className="flex items-center gap-3">
                {editUserAvatarUrl && (
                  <img
                    src={editUserAvatarUrl}
                    alt="Avatar preview"
                    className="h-10 w-10 rounded-full object-cover border"
                  />
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={async (e) => {
                    if (!selectedUser) return;
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("avatar", file);
                    try {
                      setEditLoading(true);
                      const response = await fetch(
                        `/api/user-management/${selectedUser.id}/avatar`,
                        {
                          method: "POST",
                          body: formData,
                          headers: {
                            Authorization: `Bearer ${
                              localStorage.getItem("accessToken") || ""
                            }`,
                          },
                        }
                      );
                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data?.message || "Upload failed");
                      }
                      setEditUserAvatarUrl(data.data.avatarUrl);
                      toast.success("Đã tải lên avatar");
                    } catch (err: any) {
                      toast.error(err.message || "Không thể tải lên avatar");
                    } finally {
                      setEditLoading(false);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editUserIsActive}
                onCheckedChange={setEditUserIsActive}
              />
              <span className="text-sm text-muted-foreground">
                Trạng thái hoạt động
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUserDialog(false)}
              disabled={editLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleEditUser} disabled={editLoading}>
              {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Đặt lại mật khẩu cho người dùng: {selectedUser?.full_name} (
              {selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordDialog(false)}
              disabled={resetLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? "Đang xử lý..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
