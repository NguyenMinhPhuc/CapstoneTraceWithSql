import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MarkdownEditor } from "@/components/markdown-editor";
import { companiesService, Company } from "@/services/companies.service";
import { supervisorsService } from "@/services/supervisors.service";

interface Props {
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function PositionForm({ initial, onSubmit, onClose }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initial || {
      title: "",
      description: "",
      capacity: 1,
      company_id: undefined,
      manager_user_id: undefined,
      is_active: true,
    },
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await companiesService.getAll();
        if (mounted) setCompanies(list || []);
      } catch (e) {
        // ignore
      }
    })();
    (async () => {
      try {
        const s = await supervisorsService.getAll();
        if (mounted) setSupervisors(s || []);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset form values when `initial` (editing data) changes so the form shows latest data.
  // Wait for companies to be loaded when `initial.company_id` is set so the select can match the option.
  useEffect(() => {
    if (initial) {
      // If the initial position references a company, wait for companies list.
      if (initial.company_id && companies.length === 0) return; // wait for companies
      // If initial has manager_user_id and the selected company is LHU, wait for supervisors list too
      const selectedCompany = companies.find(
        (c) => c.id === Number(initial.company_id)
      );
      if (
        selectedCompany &&
        selectedCompany.company_type === "LHU" &&
        initial.manager_user_id &&
        supervisors.length === 0
      ) {
        return; // wait for supervisors to be loaded so the manager select can match
      }
      reset({
        title: initial.title ?? "",
        description: initial.description ?? "",
        capacity: initial.capacity ?? 1,
        company_id: initial.company_id ?? undefined,
        manager_user_id: initial.manager_user_id ?? undefined,
        is_active: initial.is_active ?? true,
      });
    } else {
      reset({
        title: "",
        description: "",
        capacity: 1,
        company_id: undefined,
        manager_user_id: undefined,
        is_active: true,
      });
    }
  }, [initial, companies, supervisors, reset]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">
          {initial ? "Sửa vị trí" : "Thêm vị trí"}
        </h3>
        <form
          onSubmit={handleSubmit(async (data) => {
            if (!data.company_id) {
              alert("Vui lòng chọn công ty");
              return;
            }
            // normalize manager_user_id empty => null
            if (
              data.manager_user_id === "" ||
              data.manager_user_id === undefined
            ) {
              data.manager_user_id = null;
            }
            await onSubmit({ ...data, is_active: data.is_active ?? true });
          })}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium">Tiêu đề</label>
            <input
              className="mt-1 block w-full border rounded p-2"
              {...register("title", { required: true })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">Tiêu đề là bắt buộc</p>
            )}
          </div>

          <div className="mb-3">
            <MarkdownEditor
              label="Mô tả"
              value={watch("description") || ""}
              onChange={(v) => setValue("description", v)}
              rows={6}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Công ty</label>
            <select
              className="mt-1 block w-full border rounded p-2"
              {...register("company_id", {
                required: true,
                valueAsNumber: true,
              })}
            >
              <option value="">-- Chọn công ty --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.external_id ? ` (${c.external_id})` : ""}
                </option>
              ))}
            </select>
            {errors.company_id && (
              <p className="text-red-500 text-sm">Vui lòng chọn công ty</p>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Số lượng</label>
            <input
              type="number"
              min={1}
              className="mt-1 block w-32 border rounded p-2"
              {...register("capacity", { valueAsNumber: true })}
            />
          </div>

          {/* Manager selection for LHU companies */}
          {/** show when selected company is LHU */}
          {(() => {
            const companyId = watch
              ? watch("company_id")
              : getValues
              ? getValues().company_id
              : undefined;
            const selected = companies.find((c) => c.id === Number(companyId));
            if (selected && selected.company_type === "LHU") {
              return (
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Người quản lý (giảng viên)
                  </label>
                  <select
                    className="mt-1 block w-full border rounded p-2"
                    {...register("manager_user_id")}
                  >
                    <option value="">(Không chọn)</option>
                    {supervisors.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.full_name || s.email || s.user_id}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // For external companies, allow entering manager identifier (name or email)
            if (selected && selected.company_type !== "LHU") {
              return (
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Người quản lý (bên ngoài)
                  </label>
                  <input
                    className="mt-1 block w-full border rounded p-2"
                    placeholder="Tên hoặc email người quản lý"
                    {...register("manager_user_id")}
                  />
                </div>
              );
            }

            return null;
          })()}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              {initial ? "Lưu" : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
