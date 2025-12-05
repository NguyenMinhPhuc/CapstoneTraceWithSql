"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownViewer } from "./markdown-viewer";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, FileEdit, Info } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  label = "Mô tả",
  placeholder = "Nhập nội dung...",
  rows = 8,
  className = "",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
      >
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="edit" className="flex items-center gap-1">
              <FileEdit className="h-3 w-3" />
              Soạn thảo
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Xem trước
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="space-y-2 mt-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm"
          />
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p>
                Hỗ trợ Markdown: **bold**, *italic*, [link](url), `code`, - danh
                sách, ### tiêu đề
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <Card className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {value ? (
              <MarkdownViewer content={value} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Chưa có nội dung để xem trước
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
