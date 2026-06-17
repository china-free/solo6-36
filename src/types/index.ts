
export interface Employee {
  id: string;
  name: string;
  annualLeaveTotal: number;
}

export type LeaveType = 'annual' | 'personal' | 'sick';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type Role = 'employee' | 'manager';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  days: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: '年假',
  personal: '事假',
  sick: '病假',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
};

export const ROLE_LABELS: Record<Role, string> = {
  employee: '员工',
  manager: '管理者',
};
