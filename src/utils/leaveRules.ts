
import { Employee, LeaveRequest, LeaveType } from '@/types';

export type ApproveResult = {
  success: boolean;
  reason?: string;
};

export interface AnnualLeaveSummary {
  total: number;
  used: number;
  pending: number;
  remaining: number;
  available: number;
  usedPercent: number;
  pendingPercent: number;
}

const EMPTY_SUMMARY: AnnualLeaveSummary = {
  total: 0,
  used: 0,
  pending: 0,
  remaining: 0,
  available: 0,
  usedPercent: 0,
  pendingPercent: 0,
};

export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function computeAnnualSummary(
  employee: Employee | undefined,
  requests: LeaveRequest[],
  excludeRequestId?: string
): AnnualLeaveSummary {
  if (!employee) return EMPTY_SUMMARY;

  const own = requests.filter((r) => r.employeeId === employee.id);

  const used = own
    .filter((r) => r.type === 'annual' && r.status === 'approved')
    .reduce((sum, r) => sum + r.days, 0);

  const pending = own
    .filter(
      (r) =>
        r.type === 'annual' &&
        r.status === 'pending' &&
        r.id !== excludeRequestId
    )
    .reduce((sum, r) => sum + r.days, 0);

  const total = employee.annualLeaveTotal;
  const remaining = Math.max(0, total - used);
  const available = Math.max(0, total - used - pending);
  const usedPercent =
    total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const pendingPercent =
    total > 0
      ? Math.min(100 - usedPercent, (pending / total) * 100)
      : 0;

  return {
    total,
    used,
    pending,
    remaining,
    available,
    usedPercent,
    pendingPercent,
  };
}

export function validateSubmit(
  type: LeaveType,
  days: number,
  summary: AnnualLeaveSummary
): ApproveResult {
  if (type !== 'annual') return { success: true };

  if (days > summary.available) {
    const hint =
      summary.pending > 0
        ? `（已休 ${summary.used} 天、待审批占用 ${summary.pending} 天）`
        : `（已休 ${summary.used} 天）`;
    return {
      success: false,
      reason: `可提交年假不足${hint}，当前可提交额度仅 ${summary.available} 天，本申请需要 ${days} 天。`,
    };
  }

  return { success: true };
}

export function validateApprove(
  request: LeaveRequest,
  employee: Employee | undefined,
  requests: LeaveRequest[]
): ApproveResult {
  if (request.type !== 'annual') return { success: true };
  if (!employee) return { success: false, reason: '员工不存在' };

  const summary = computeAnnualSummary(employee, requests, request.id);
  if (request.days > summary.available) {
    return {
      success: false,
      reason: `年假额度不足。该员工年假总额 ${summary.total} 天，已休 ${summary.used} 天，其他待审批占用 ${summary.pending} 天，当前可批额度仅 ${summary.available} 天，而本申请需要 ${request.days} 天。`,
    };
  }

  return { success: true };
}
