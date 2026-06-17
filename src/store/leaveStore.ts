
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, LeaveRequest, LeaveStatus, LeaveType, Role } from '@/types';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: '张三', annualLeaveTotal: 15 },
  { id: 'emp-2', name: '李四', annualLeaveTotal: 15 },
  { id: 'emp-3', name: '王五', annualLeaveTotal: 10 },
  { id: 'emp-4', name: '赵六', annualLeaveTotal: 12 },
];

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

  updateRequestStatus: (requestId: string, status: LeaveStatus) => void;

  getRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  getPendingRequests: () => LeaveRequest[];
  getAllRequests: () => LeaveRequest[];

  getUsedAnnualDays: (employeeId: string) => number;
  getRemainingAnnualDays: (employeeId: string) => number;

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
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status } : r
          ),
        }));
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

      getRemainingAnnualDays: (employeeId) => {
        const employee = get().employees.find((e) => e.id === employeeId);
        if (!employee) return 0;
        const used = get().getUsedAnnualDays(employeeId);
        return Math.max(0, employee.annualLeaveTotal - used);
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
