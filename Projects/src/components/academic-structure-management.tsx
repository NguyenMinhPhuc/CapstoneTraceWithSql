"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentManagement } from "./department-management";
import { MajorManagement } from "./major-management";
import { ClassManagement } from "./class-management";
import { Building2, GraduationCap, Users } from "lucide-react";

export function AcademicStructureManagement() {
  const [activeTab, setActiveTab] = useState("departments");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý cấu trúc học thuật</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý khoa, ngành và lớp học trong hệ thống
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Khoa
          </TabsTrigger>
          <TabsTrigger value="majors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Ngành
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lớp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>

        <TabsContent value="majors">
          <MajorManagement />
        </TabsContent>

        <TabsContent value="classes">
          <ClassManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
