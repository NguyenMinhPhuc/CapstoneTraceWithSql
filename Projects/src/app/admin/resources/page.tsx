"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Resource,
  ResourceLink,
  resourcesService,
} from "@/services/resources.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/markdown-editor";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  BookOpen,
} from "lucide-react";

const CATEGORIES = ["graduation", "internship"] as const;

const CATEGORY_ICONS = {
  graduation: BookOpen,
  internship: FileText,
};

const CATEGORY_COLORS = {
  graduation: "bg-blue-100 text-blue-800",
  internship: "bg-green-100 text-green-800",
};

const CATEGORY_LABELS = {
  graduation: "Tốt nghiệp",
  internship: "Thực tập",
};

export default function ResourceManagementPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    category: "graduation" as (typeof CATEGORIES)[number],
    is_active: true,
  });

  // Links management
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>([]);
  const [linkFormData, setLinkFormData] = useState({ label: "", url: "" });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState<Record<string, number>>({});

  // Auth guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
    if (
      !isAuthLoading &&
      user &&
      user.role !== "admin" &&
      user.role !== "manager"
    ) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  // Load resources
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "manager")) {
      loadResources();
      loadStatistics();
    }
  }, [user, currentPage, searchTerm, filterCategory]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await resourcesService.listResources({
        page: currentPage,
        pageSize: 10,
        category:
          filterCategory && filterCategory !== "all"
            ? filterCategory
            : undefined,
        search: searchTerm || undefined,
      });
      setResources(response.resources);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài nguyên",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await resourcesService.listResources({
        page: 1,
        pageSize: 1000,
      });
      const categoryCounts: Record<string, number> = {};
      response.resources.forEach((resource) => {
        categoryCounts[resource.category] =
          (categoryCounts[resource.category] || 0) + 1;
      });
      setStats(categoryCounts);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await resourcesService.createResource(formData);
      toast({
        title: "Thành công",
        description: "Đã tạo tài nguyên mới",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadResources();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tạo tài nguyên",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedResource) return;
    try {
      await resourcesService.updateResource(selectedResource.id, formData);
      toast({
        title: "Thành công",
        description: "Đã cập nhật tài nguyên",
      });
      setIsEditDialogOpen(false);
      setSelectedResource(null);
      resetForm();
      loadResources();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật tài nguyên",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    try {
      await resourcesService.deleteResource(selectedResource.id);
      toast({
        title: "Thành công",
        description: "Đã xóa tài nguyên",
      });
      setIsDeleteDialogOpen(false);
      setSelectedResource(null);
      loadResources();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể xóa tài nguyên",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      summary: resource.summary || "",
      category: resource.category as (typeof CATEGORIES)[number],
      is_active: resource.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDeleteDialogOpen(true);
  };

  const openLinksDialog = async (resource: Resource) => {
    setSelectedResource(resource);
    setIsLinksDialogOpen(true);
    try {
      const data = await resourcesService.getResource(resource.id);
      setResourceLinks(data.links || []);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách liên kết",
        variant: "destructive",
      });
    }
  };

  const handleAddLink = async () => {
    if (!selectedResource || !linkFormData.label || !linkFormData.url) return;
    try {
      await resourcesService.addResourceLink(selectedResource.id, linkFormData);
      toast({
        title: "Thành công",
        description: "Đã thêm liên kết",
      });
      setLinkFormData({ label: "", url: "" });
      const data = await resourcesService.getResource(selectedResource.id);
      setResourceLinks(data.links || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm liên kết",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLink = async () => {
    if (
      !selectedResource ||
      !editingLinkId ||
      !linkFormData.label ||
      !linkFormData.url
    )
      return;
    try {
      await resourcesService.updateResourceLink(
        selectedResource.id,
        editingLinkId,
        linkFormData
      );
      toast({
        title: "Thành công",
        description: "Đã cập nhật liên kết",
      });
      setLinkFormData({ label: "", url: "" });
      setEditingLinkId(null);
      const data = await resourcesService.getResource(selectedResource.id);
      setResourceLinks(data.links || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật liên kết",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!selectedResource) return;
    try {
      await resourcesService.deleteResourceLink(selectedResource.id, linkId);
      toast({
        title: "Thành công",
        description: "Đã xóa liên kết",
      });
      const data = await resourcesService.getResource(selectedResource.id);
      setResourceLinks(data.links || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa liên kết",
        variant: "destructive",
      });
    }
  };

  const startEditLink = (link: ResourceLink) => {
    setEditingLinkId(link.id);
    setLinkFormData({ label: link.label, url: link.url });
  };

  const cancelEditLink = () => {
    setEditingLinkId(null);
    setLinkFormData({ label: "", url: "" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      summary: "",
      category: "graduation",
      is_active: true,
    });
  };

  if (
    isAuthLoading ||
    !user ||
    (user.role !== "admin" && user.role !== "manager")
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Tài nguyên</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm tài nguyên
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {CATEGORY_LABELS[category]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats[category] || 0}</div>
              </CardContent>
            </Card>
          );
        })}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tổng cộng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats).reduce((sum, count) => sum + count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tài nguyên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên tài nguyên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Số links</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[300px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : resources.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không tìm thấy tài nguyên nào
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => {
                const Icon =
                  CATEGORY_ICONS[
                    resource.category as keyof typeof CATEGORY_ICONS
                  ] || FileText;
                return (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">
                      {resource.name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        {resource.summary
                          ? resource.summary
                              .replace(/[#*`[\]]/g, "")
                              .substring(0, 100)
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          CATEGORY_COLORS[
                            resource.category as keyof typeof CATEGORY_COLORS
                          ] || "bg-gray-100 text-gray-800"
                        }
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {CATEGORY_LABELS[
                          resource.category as keyof typeof CATEGORY_LABELS
                        ] || resource.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {(resource as any).links_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={resource.is_active ? "default" : "secondary"}
                      >
                        {resource.is_active ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openLinksDialog(resource)}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(resource)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Trang {currentPage} / {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm tài nguyên mới</DialogTitle>
            <DialogDescription>
              Tạo tài nguyên học tập mới cho sinh viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên tài nguyên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nhập tên tài nguyên"
              />
            </div>
            <MarkdownEditor
              value={formData.summary}
              onChange={(value) => setFormData({ ...formData, summary: value })}
              label="Mô tả (hỗ trợ Markdown)"
              placeholder="Nhập mô tả chi tiết về tài nguyên...\n\nVí dụ:\n- **In đậm**\n- *In nghiêng*\n- [Liên kết](url)\n- ### Tiêu đề"
              rows={10}
            />
            <div>
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as (typeof CATEGORIES)[number],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Kích hoạt</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài nguyên</DialogTitle>
            <DialogDescription>Cập nhật thông tin tài nguyên</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên tài nguyên</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <MarkdownEditor
              value={formData.summary}
              onChange={(value) => setFormData({ ...formData, summary: value })}
              label="Mô tả (hỗ trợ Markdown)"
              placeholder="Nhập mô tả chi tiết về tài nguyên..."
              rows={10}
            />
            <div>
              <Label htmlFor="edit-category">Danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as (typeof CATEGORIES)[number],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="edit-is_active">Kích hoạt</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedResource(null);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleEdit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài nguyên &quot;
              {selectedResource?.name}&quot;? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedResource(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Links Management Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Quản lý liên kết - {selectedResource?.name}
            </DialogTitle>
            <DialogDescription>
              Thêm và quản lý các liên kết cho tài nguyên này
            </DialogDescription>
          </DialogHeader>

          {/* Add/Edit Link Form */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold">
              {editingLinkId ? "Chỉnh sửa liên kết" : "Thêm liên kết mới"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nhãn</Label>
                <Input
                  value={linkFormData.label}
                  onChange={(e) =>
                    setLinkFormData({ ...linkFormData, label: e.target.value })
                  }
                  placeholder="VD: Tải xuống, Xem trực tuyến..."
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={linkFormData.url}
                  onChange={(e) =>
                    setLinkFormData({ ...linkFormData, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              {editingLinkId ? (
                <>
                  <Button onClick={handleUpdateLink} size="sm">
                    Cập nhật
                  </Button>
                  <Button onClick={cancelEditLink} variant="outline" size="sm">
                    Hủy
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddLink} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm
                </Button>
              )}
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Danh sách liên kết</h3>
            {resourceLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có liên kết nào
              </p>
            ) : (
              <div className="space-y-2">
                {resourceLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{link.label}</div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {link.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditLink(link)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setIsLinksDialogOpen(false);
                setSelectedResource(null);
                setResourceLinks([]);
                setLinkFormData({ label: "", url: "" });
                setEditingLinkId(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
