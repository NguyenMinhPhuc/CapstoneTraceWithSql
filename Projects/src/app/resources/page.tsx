"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Resource,
  ResourceLink,
  resourcesService,
} from "@/services/resources.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MarkdownViewer } from "@/components/markdown-viewer";
import {
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  Download,
  Link as LinkIcon,
} from "lucide-react";

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

type ResourceWithLinks = Resource & {
  links?: ResourceLink[];
};

export default function ResourcesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [resources, setResources] = useState<ResourceWithLinks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "graduation" | "internship"
  >("all");

  // Auth guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // Load resources
  useEffect(() => {
    if (user) {
      loadResources();
    }
  }, [user, activeTab]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await resourcesService.listResources({
        page: 1,
        pageSize: 100,
        category: activeTab === "all" ? undefined : activeTab,
        isActive: true, // Only show active resources
      });

      // Load links for each resource
      const resourcesWithLinks = await Promise.all(
        response.resources.map(async (resource) => {
          try {
            const detail = await resourcesService.getResource(resource.id);
            return { ...resource, links: detail.links || [] };
          } catch {
            return { ...resource, links: [] };
          }
        })
      );

      setResources(resourcesWithLinks);
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

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.summary &&
        resource.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const graduationResources = filteredResources.filter(
    (r) => r.category === "graduation"
  );
  const internshipResources = filteredResources.filter(
    (r) => r.category === "internship"
  );

  if (isAuthLoading || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tài nguyên & Tài liệu</h1>
        <p className="text-muted-foreground mt-2">
          Tài liệu hướng dẫn, biểu mẫu và tài nguyên học tập cho sinh viên
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm tài nguyên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({filteredResources.length})
          </TabsTrigger>
          <TabsTrigger value="graduation">
            <BookOpen className="mr-2 h-4 w-4" />
            Tốt nghiệp ({graduationResources.length})
          </TabsTrigger>
          <TabsTrigger value="internship">
            <FileText className="mr-2 h-4 w-4" />
            Thực tập ({internshipResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <ResourcesSkeleton />
          ) : filteredResources.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              {graduationResources.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Tài nguyên Tốt nghiệp
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {graduationResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}
              {internshipResources.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tài nguyên Thực tập
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {internshipResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="graduation" className="space-y-4 mt-6">
          {isLoading ? (
            <ResourcesSkeleton />
          ) : graduationResources.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {graduationResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="internship" className="space-y-4 mt-6">
          {isLoading ? (
            <ResourcesSkeleton />
          ) : internshipResources.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {internshipResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceCard({ resource }: { resource: ResourceWithLinks }) {
  const Icon =
    CATEGORY_ICONS[resource.category as keyof typeof CATEGORY_ICONS] ||
    FileText;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg flex items-start gap-2">
            <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
            <span>{resource.name}</span>
          </CardTitle>
        </div>
        <Badge
          className={
            CATEGORY_COLORS[resource.category as keyof typeof CATEGORY_COLORS]
          }
        >
          {CATEGORY_LABELS[resource.category as keyof typeof CATEGORY_LABELS]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {resource.summary && (
          <div className="text-sm text-muted-foreground max-h-[150px] overflow-y-auto">
            <MarkdownViewer content={resource.summary} />
          </div>
        )}

        {resource.links && resource.links.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Liên kết ({resource.links.length})
            </div>
            <div className="space-y-2">
              {resource.links.map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    <span className="truncate flex-1 text-left">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {(!resource.links || resource.links.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Chưa có liên kết tải xuống
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ResourcesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {searchTerm ? "Không tìm thấy kết quả" : "Chưa có tài nguyên"}
      </h3>
      <p className="text-muted-foreground">
        {searchTerm
          ? `Không tìm thấy tài nguyên nào khớp với "${searchTerm}"`
          : "Hiện tại chưa có tài nguyên nào được thêm vào hệ thống"}
      </p>
    </div>
  );
}
