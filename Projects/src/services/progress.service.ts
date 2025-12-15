import apiClient from "@/lib/api-client";

export const progressService = {
  async getWeeklyReportsByRegistration(registrationId: string) {
    const res = await apiClient.get(`/progress-reports`, {
      params: { registrationId },
    });
    return res.data.data;
  },

  async updateWeeklyReport(reportId: string, payload: Partial<any>) {
    const res = await apiClient.put(`/progress-reports/${reportId}`, payload);
    return res.data.data;
  },

  async createEarlyInternshipReport(payload: any) {
    const res = await apiClient.post(`/early-internship-reports`, payload);
    return res.data.data;
  },

  async updateEarlyInternshipReport(reportId: string, payload: Partial<any>) {
    const res = await apiClient.put(
      `/early-internship-reports/${reportId}`,
      payload
    );
    return res.data.data;
  },
};
