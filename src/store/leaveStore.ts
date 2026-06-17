
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, LeaveRequest, LeaveStatus, LeaveType, Role } from '@/types';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: '张三', annualLeaveTotal: 15 },
  { id: 'emp-2', name: '李四', annualLeaveTotal: 15 },
  { id: 'emp-3', name: '王五', annualLeaveTotal: 10 },
  { id: 'emp-4', name: '赵六', annualLeaveTotal: 12 },
];

type ApproveResult = {
  success: boolean;
  reason?: string;
};

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
  }) => void;

  updateRequestStatus: (requestId: string, status: LeaveStatus) => ApproveResult;

  getRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  getPendingRequests: () => LeaveRequest[];
  getAllRequests: () => LeaveRequest[];

  getUsedAnnualDays: (employeeId: string) => number;
  getPendingAnnualDays: (employeeId: string, excludeRequestId?: string) => number;
  getRemainingAnnualDays: (employeeId: string) => number;
  getAvailableAnnualDays: (employeeId: string) => number;
  canApproveAnnualRequest: (requestId: string) => ApproveResult;

  getCurrentEmployee: () => Employee | undefined;
}

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
        const { currentEmployeeId, employees } = get();
        const employee = employees.find((e) => e.id === currentEmployeeId);
        if (!employee) return;

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
      },

      updateRequestStatus: (requestId, status) => {
        const request = get().requests.find((r) => r.id === requestId);
        if (!request) {
          return { success: false, reason: '申请不存在' };
        }

        if (status === 'approved' && request.type === 'annual') {
          const check = get().canApproveAnnualRequest(requestId);
          if (!check.success) {
            return check;
          }
        }

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status } : r
          ),
        }));

        return { success: true };
      },

      getRequestsByEmployee: (employeeId) => {
        return get()
          .requests.filter((r) => r.employeeId === employeeId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      getPendingRequests: () => {
        return get()
          .requests.filter((r) => r.status === 'pending')
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
      },

      getAllRequests: () => {
        return get()
          .requests.slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      getUsedAnnualDays: (employeeId) => {
        return get()
          .requests.filter(
            (r) =>
              r.employeeId === employeeId &&
              r.type === 'annual' &&
              r.status === 'approved'
          )
          .reduce((sum, r) => sum + r.days, 0);
      },

      getPendingAnnualDays: (employeeId, excludeRequestId) => {
        return get()
          .requests.filter(
            (r) =>
              r.employeeId === employeeId &&
              r.type === 'annual' &&
              r.status === 'pending' &&
              r.id !== excludeRequestId
          )
          .reduce((sum, r) => sum + r.days, 0);
      },

      getRemainingAnnualDays: (employeeId) => {
        const employee = get().employees.find((e) => e.id === employeeId);
        if (!employee) return 0;
        const used = get().getUsedAnnualDays(employeeId);
        return Math.max(0, employee.annualLeaveTotal - used);
      },

      getAvailableAnnualDays: (employeeId) => {
        const employee = get().employees.find((e) => e.id === employeeId);
        if (!employee) return 0;
        const used = get().getUsedAnnualDays(employeeId);
        const pending = get().getPendingAnnualDays(employeeId);
        return Math.max(0, employee.annualLeaveTotal - used - pending);
      },

      canApproveAnnualRequest: (requestId) => {
        const request = get().requests.find((r) => r.id === requestId);
        if (!request) {
          return { success: false, reason: '申请不存在' };
        }
        if (request.type !== 'annual') {
          return { success: true };
        }

        const employee = get().employees.find((e) => e.id === request.employeeId);
        if (!employee) {
          return { success: false, reason: '员工不存在' };
        }

        const used = get().getUsedAnnualDays(request.employeeId);
        const otherPending = get().getPendingAnnualDays(request.employeeId, requestId);
        const available = employee.annualLeaveTotal - used - otherPending;

        if (request.days > available) {
          return {
            success: false,
            reason: `年假额度不足。该员工年假总额 ${employee.annualLeaveTotal} 天，已休 ${used} 天，其他待审批占用 ${otherPending} 天，当前可批额度仅 ${available} 天，而本申请需要 ${request.days} 天。`,
          };
        }

        return { success: true };
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
