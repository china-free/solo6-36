
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, LeaveRequest, LeaveStatus, LeaveType, Role } from '@/types';
import {
  ApproveResult,
  AnnualLeaveSummary,
  computeAnnualSummary,
  validateSubmit,
  validateApprove,
} from '@/utils/leaveRules';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: '张三', annualLeaveTotal: 15 },
  { id: 'emp-2', name: '李四', annualLeaveTotal: 15 },
  { id: 'emp-3', name: '王五', annualLeaveTotal: 10 },
  { id: 'emp-4', name: '赵六', annualLeaveTotal: 12 },
];

export interface PendingRequestItem {
  request: LeaveRequest;
  approvalStatus: ApproveResult;
}

export interface DashboardStats {
  totalEmployees: number;
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
}

interface LeaveState {
  employees: Employee[];
  requests: LeaveRequest[];
  currentEmployeeId: string;
  currentRole: Role;

  setCurrentRole: (role: Role) => void;
  setCurrentEmployeeId: (id: string) => void;

  submitRequest: (data: {
    startDate: string;
    endDate: string;
    type: LeaveType;
    days: number;
    reason: string;
  }) => ApproveResult;

  updateRequestStatus: (
    requestId: string,
    status: LeaveStatus
  ) => ApproveResult;

  getAnnualLeaveSummary: (employeeId: string) => AnnualLeaveSummary;
  getRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  getPendingRequests: () => LeaveRequest[];
  getPendingRequestsWithApproval: () => PendingRequestItem[];
  getAllRequests: () => LeaveRequest[];
  getDashboardStats: () => DashboardStats;
  getCurrentEmployee: () => Employee | undefined;
}

const sortByCreatedDesc = (a: LeaveRequest, b: LeaveRequest) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const sortByCreatedAsc = (a: LeaveRequest, b: LeaveRequest) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      employees: INITIAL_EMPLOYEES,
      requests: [],
      currentEmployeeId: INITIAL_EMPLOYEES[0].id,
      currentRole: 'employee',

      setCurrentRole: (role) => set({ currentRole: role }),
      setCurrentEmployeeId: (id) => set({ currentEmployeeId: id }),

      submitRequest: (data) => {
        const { currentEmployeeId, employees, requests } = get();
        const employee = employees.find((e) => e.id === currentEmployeeId);
        if (!employee) {
          return { success: false, reason: '员工不存在' };
        }

        const summary = computeAnnualSummary(employee, requests);
        const validation = validateSubmit(data.type, data.days, summary);
        if (!validation.success) return validation;

        const newRequest: LeaveRequest = {
          id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          employeeId: currentEmployeeId,
          employeeName: employee.name,
          startDate: data.startDate,
          endDate: data.endDate,
          type: data.type,
          days: data.days,
          reason: data.reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          requests: [newRequest, ...state.requests],
        }));

        return { success: true };
      },

      updateRequestStatus: (requestId, status) => {
        const request = get().requests.find((r) => r.id === requestId);
        if (!request) {
          return { success: false, reason: '申请不存在' };
        }

        if (status === 'approved') {
          const employee = get().employees.find(
            (e) => e.id === request.employeeId
          );
          const validation = validateApprove(
            request,
            employee,
            get().requests
          );
          if (!validation.success) return validation;
        }

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status } : r
          ),
        }));

        return { success: true };
      },

      getAnnualLeaveSummary: (employeeId) => {
        const { employees, requests } = get();
        const employee = employees.find((e) => e.id === employeeId);
        return computeAnnualSummary(employee, requests);
      },

      getRequestsByEmployee: (employeeId) => {
        return get()
          .requests.filter((r) => r.employeeId === employeeId)
          .sort(sortByCreatedDesc);
      },

      getPendingRequests: () => {
        return get()
          .requests.filter((r) => r.status === 'pending')
          .sort(sortByCreatedAsc);
      },

      getPendingRequestsWithApproval: () => {
        const { employees, requests } = get();
        return requests
          .filter((r) => r.status === 'pending')
          .sort(sortByCreatedAsc)
          .map((request) => {
            const employee = employees.find(
              (e) => e.id === request.employeeId
            );
            return {
              request,
              approvalStatus: validateApprove(request, employee, requests),
            };
          });
      },

      getAllRequests: () => {
        return get().requests.slice().sort(sortByCreatedDesc);
      },

      getDashboardStats: () => {
        const { employees, requests } = get();
        return {
          totalEmployees: employees.length,
          totalRequests: requests.length,
          pendingCount: requests.filter((r) => r.status === 'pending').length,
          approvedCount: requests.filter((r) => r.status === 'approved')
            .length,
        };
      },

      getCurrentEmployee: () => {
        const { employees, currentEmployeeId } = get();
        return employees.find((e) => e.id === currentEmployeeId);
      },
    }),
    {
      name: 'leave-management-storage',
      partialize: (state) => ({
        employees: state.employees,
        requests: state.requests,
        currentEmployeeId: state.currentEmployeeId,
        currentRole: state.currentRole,
      }),
    }
  )
);
