
import { LeaveStatus, LeaveType } from '@/types';

export const STATUS_STYLES: Record<LeaveStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const STATUS_TAG_STYLES: Record<LeaveStatus, string> = {
  pending:
    'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20',
  approved:
    'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20',
  rejected:
    'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20',
};

export const TYPE_STYLES: Record<LeaveType, string> = {
  annual: 'bg-blue-50 text-blue-700 border-blue-200',
  personal: 'bg-purple-50 text-purple-700 border-purple-200',
  sick: 'bg-teal-50 text-teal-700 border-teal-200',
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getProgressColor(percent: number): string {
  if (percent >= 90) return 'from-rose-500 to-red-500';
  if (percent >= 70) return 'from-amber-500 to-orange-500';
  return 'from-emerald-500 to-teal-500';
}
