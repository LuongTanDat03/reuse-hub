import axios from 'axios';
import { ApiResponse } from '../types/api';
import {
  ReportResponse,
  ReportPage,
  CreateReportRequest,
  ResolveReportRequest,
  ReportStatus,
} from '../types/report';
import { API_BASE_URL } from '../types/constants';

const REPORT_API_BASE_URL = `${API_BASE_URL}/moderation/reports`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// =================================================================
// USER ENDPOINTS
// =================================================================

export const createReport = async (
  reporterId: string,
  request: CreateReportRequest
): Promise<ApiResponse<ReportResponse>> => {
  const response = await axios.post<ApiResponse<ReportResponse>>(
    `${REPORT_API_BASE_URL}/create/${reporterId}`,
    request,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getReportById = async (
  reportId: string
): Promise<ApiResponse<ReportResponse>> => {
  const response = await axios.get<ApiResponse<ReportResponse>>(
    `${REPORT_API_BASE_URL}/${reportId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getMyReports = async (
  userId: string,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<ReportPage>> => {
  const response = await axios.get<ApiResponse<ReportPage>>(
    `${REPORT_API_BASE_URL}/my-reports/${userId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

// =================================================================
// ADMIN ENDPOINTS
// =================================================================

export const getPendingReports = async (
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<ReportPage>> => {
  const response = await axios.get<ApiResponse<ReportPage>>(
    `${REPORT_API_BASE_URL}/admin/pending`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

export const getAllReports = async (
  status?: ReportStatus,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<ReportPage>> => {
  const response = await axios.get<ApiResponse<ReportPage>>(
    `${REPORT_API_BASE_URL}/admin/all`,
    {
      headers: getAuthHeaders(),
      params: { status, pageNo, pageSize },
    }
  );
  return response.data;
};

export const getReportsByEntity = async (
  entityType: string,
  entityId: string,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<ReportPage>> => {
  const response = await axios.get<ApiResponse<ReportPage>>(
    `${REPORT_API_BASE_URL}/admin/entity/${entityType}/${entityId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

export const countPendingReports = async (): Promise<ApiResponse<number>> => {
  const response = await axios.get<ApiResponse<number>>(
    `${REPORT_API_BASE_URL}/admin/count/pending`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const startReview = async (
  reportId: string,
  adminId: string
): Promise<ApiResponse<ReportResponse>> => {
  const response = await axios.put<ApiResponse<ReportResponse>>(
    `${REPORT_API_BASE_URL}/admin/${reportId}/start-review/${adminId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const resolveReport = async (
  reportId: string,
  adminId: string,
  request: ResolveReportRequest
): Promise<ApiResponse<ReportResponse>> => {
  const response = await axios.put<ApiResponse<ReportResponse>>(
    `${REPORT_API_BASE_URL}/admin/${reportId}/resolve/${adminId}`,
    request,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const rejectReport = async (
  reportId: string,
  adminId: string,
  reason?: string
): Promise<ApiResponse<ReportResponse>> => {
  const response = await axios.put<ApiResponse<ReportResponse>>(
    `${REPORT_API_BASE_URL}/admin/${reportId}/reject/${adminId}`,
    null,
    {
      headers: getAuthHeaders(),
      params: { reason },
    }
  );
  return response.data;
};
